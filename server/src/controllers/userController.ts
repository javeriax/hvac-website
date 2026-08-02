import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { ROLES, User, UserDoc } from '../models/User';
import { Job } from '../models/Job';
import { Invoice } from '../models/Invoice';
import { ServiceRequest } from '../models/ServiceRequest';
import { MaintenanceContract } from '../models/MaintenanceContract';

// User list with role, status and search filters.
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const filter: FilterQuery<UserDoc> = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim(), 'i');
    Object.assign(filter, { $or: [{ name: rx }, { email: rx }, { phone: rx }] });
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).limit(Number(req.query.limit) || 300);
  res.json({ success: true, count: users.length, data: users });
});

// Technician roster with each one's job count for today, used by the dispatch board.
export const listTechnicians = asyncHandler(async (_req: Request, res: Response) => {
  const technicians = await User.find({ role: 'technician', isActive: true }).sort({ name: 1 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const loads = await Job.aggregate([
    {
      $match: {
        scheduledStart: { $gte: today, $lt: tomorrow },
        status: { $nin: ['cancelled'] },
      },
    },
    { $group: { _id: '$technician', jobsToday: { $sum: 1 } } },
  ]);
  const loadMap = new Map(loads.map((l) => [String(l._id), l.jobsToday]));

  res.json({
    success: true,
    data: technicians.map((t) => ({
      ...t.toJSON(),
      jobsToday: loadMap.get(t.id) ?? 0,
    })),
  });
});

// One user. For customers this also returns their full history and lifetime value.
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  // Admins opening a customer record expect the full account history in one call.
  if (user.role === 'customer') {
    const [requests, jobs, invoices, contract] = await Promise.all([
      ServiceRequest.find({ customer: user._id }).sort({ createdAt: -1 }).limit(20),
      Job.find({ customer: user._id })
        .populate('technician', 'name')
        .sort({ scheduledStart: -1 })
        .limit(20),
      Invoice.find({ customer: user._id }).sort({ createdAt: -1 }).limit(20),
      MaintenanceContract.findOne({ customer: user._id, status: { $in: ['active', 'expiring'] } }),
    ]);

    const lifetimeValue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((a, i) => a + i.total, 0);

    return res.json({
      success: true,
      data: { user, requests, jobs, invoices, contract, lifetimeValue: Math.round(lifetimeValue) },
    });
  }

  if (user.role === 'technician') {
    const jobs = await Job.find({ technician: user._id })
      .populate('customer', 'name')
      .sort({ scheduledStart: -1 })
      .limit(30);
    return res.json({ success: true, data: { user, jobs } });
  }

  return res.json({ success: true, data: { user } });
});

// Admin creating any account, including staff.
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role, technician, customer } = req.body;

  if (!name || !email || !password || !role) {
    throw ApiError.badRequest('Name, email, password and role are required');
  }
  if (!ROLES.includes(role)) throw ApiError.badRequest('Unknown role');

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw ApiError.conflict('An account with that email already exists');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    technician: role === 'technician' ? { ...technician, hiredAt: new Date() } : undefined,
    customer:
      role === 'customer'
        ? { ...customer, customerSince: new Date() }
        : undefined,
  });

  res.status(201).json({ success: true, data: user });
});

// Admin editing a user. Sub-documents merge, so a partial update will not wipe fields.
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { name, email, phone, avatarUrl, isActive, technician, customer, password } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (password) user.password = password;

  // Sub-documents merge rather than replace, so a partial patch never wipes fields.
  const plain = (sub: unknown) =>
    sub && typeof (sub as { toObject?: () => unknown }).toObject === 'function'
      ? (sub as { toObject: () => unknown }).toObject()
      : sub;

  if (technician && user.role === 'technician') {
    user.technician = { ...(plain(user.technician) as object), ...technician } as never;
  }
  if (customer && user.role === 'customer') {
    user.customer = { ...(plain(user.customer) as object), ...customer } as never;
  }

  await user.save();
  res.json({ success: true, data: user });
});

// Availability change. Pass "me" as the id to update yourself.
export const setTechnicianStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.params.id === 'me' ? user.id : req.params.id;

  if (user.role === 'technician' && targetId !== user.id) throw ApiError.forbidden();

  const tech = await User.findOne({ _id: targetId, role: 'technician' });
  if (!tech || !tech.technician) throw ApiError.notFound('Technician not found');

  tech.technician.status = req.body.status;
  await tech.save();

  res.json({ success: true, data: tech });
});

// Soft delete. Deactivates rather than removing, so past jobs keep their references.
export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.id === req.user!.id) throw ApiError.badRequest('You cannot deactivate your own account');

  user.isActive = false;
  await user.save();
  res.json({ success: true, message: `${user.name} has been deactivated` });
});
