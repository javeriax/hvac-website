import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { User, UserDoc } from '../models/User';
import { notify } from '../services/notify';

function authPayload(user: UserDoc) {
  return {
    token: signToken({ sub: user.id, role: user.role, name: user.name }),
    user: user.toJSON(),
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, address, propertyType, companyName } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email and password are required');
  }
  if (String(password).length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw ApiError.conflict('An account with that email already exists');

  // Self-registration always creates a customer — staff accounts are provisioned by an admin.
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'customer',
    customer: {
      address: address ?? { line1: '', city: '', state: '', zip: '' },
      propertyType: propertyType ?? 'residential',
      companyName,
      customerSince: new Date(),
    },
  });

  await notify({
    user: user._id,
    type: 'system',
    title: 'Welcome to ArcticAir',
    message:
      'Your customer account is live. Request a service, track a technician, and manage invoices from here.',
    link: '/dashboard/customer',
  });

  res.status(201).json({ success: true, data: authPayload(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Those credentials do not match our records');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, data: authPayload(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user!.toJSON() });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { name, phone, avatarUrl, address, propertyType, companyName, preferredContact } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (user.role === 'customer' && user.customer) {
    if (address) user.customer.address = { ...user.customer.address, ...address };
    if (propertyType) user.customer.propertyType = propertyType;
    if (companyName !== undefined) user.customer.companyName = companyName;
    if (preferredContact) user.customer.preferredContact = preferredContact;
  }

  await user.save();
  res.json({ success: true, data: user.toJSON() });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current and new password are required');
  }
  if (String(newPassword).length < 8) {
    throw ApiError.badRequest('New password must be at least 8 characters');
  }

  const user = await User.findById(req.user!.id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
