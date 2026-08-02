import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { User, UserDoc } from '../models/User';
import { ServiceRequest } from '../models/ServiceRequest';
import { notify } from '../services/notify';

function authPayload(user: UserDoc) {
  return {
    token: signToken({ sub: user.id, role: user.role, name: user.name }),
    user: user.toJSON(),
  };
}

// Sign up. Always creates a customer; staff accounts are made by an admin.
// Also picks up any guest requests raised with this email so the history is there on day one.
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

  // Self-registration always creates a customer, staff accounts are provisioned by an admin.
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

  // Someone may have raised requests as a guest before signing up. Attach any
  // that used this email so their history is there the moment they log in.
  const claimed = await ServiceRequest.updateMany(
    { customer: { $exists: false }, 'contact.email': user.email },
    { $set: { customer: user._id } },
  );

  await notify({
    user: user._id,
    type: 'system',
    title: 'Welcome to ArcticAir',
    message: claimed.modifiedCount
      ? `Your account is live, and we found ${claimed.modifiedCount} earlier request(s) under this email.`
      : 'Your customer account is live. Request a service, track a technician, and manage invoices from here.',
    link: '/dashboard/customer',
  });

  res.status(201).json({
    success: true,
    data: { ...authPayload(user), claimedRequests: claimed.modifiedCount },
  });
});

// Email + password in, JWT + user out. Also stamps lastLoginAt.
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

// Returns whoever the current token belongs to. Used to restore the session on refresh.
export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user!.toJSON() });
});

// Lets a user edit their own name, phone and (for customers) address.
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

// Password change. Requires the current one so a stolen tab cannot lock the owner out.
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
