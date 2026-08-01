import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { trackingCode } from '../utils/sequence';
import { filesToImages } from '../middleware/upload';
import { ServiceRequest, ServiceRequestDoc } from '../models/ServiceRequest';
import { User } from '../models/User';
import { notify, notifyRole } from '../services/notify';

/** Body arrives as multipart when photos are attached, so nested objects come through as JSON strings. */
function parseMaybeJson<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

export const createServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const address = parseMaybeJson(body.address, null as null | Record<string, string>);

  if (!body.serviceType || !body.description) {
    throw ApiError.badRequest('Service type and a description of the issue are required');
  }
  if (!address?.line1 || !address?.city || !address?.state || !address?.zip) {
    throw ApiError.badRequest('A complete service address is required');
  }

  // Signed-in customers inherit their profile contact details; guests must supply them.
  const contact = req.user
    ? {
        name: body.contactName || req.user.name,
        email: body.contactEmail || req.user.email,
        phone: body.contactPhone || req.user.phone || '',
      }
    : {
        name: body.contactName,
        email: body.contactEmail,
        phone: body.contactPhone,
      };

  if (!contact.name || !contact.email || !contact.phone) {
    throw ApiError.badRequest('Your name, email and phone number are required');
  }

  const priority = body.serviceType === 'emergency' ? 'emergency' : body.priority || 'normal';

  const request = await ServiceRequest.create({
    trackingCode: trackingCode('SR'),
    customer: req.user?.role === 'customer' ? req.user._id : undefined,
    contact,
    serviceType: body.serviceType,
    propertyType: body.propertyType || 'residential',
    title: body.title || `${String(body.serviceType).replace('-', ' ')} request`,
    description: body.description,
    priority,
    preferredDate: body.preferredDate || undefined,
    preferredWindow: body.preferredWindow || 'anytime',
    address,
    photos: filesToImages(req.files as Express.Multer.File[]),
    systemAge: body.systemAge,
    systemBrand: body.systemBrand,
    timeline: [{ status: 'submitted', note: 'Request received', at: new Date() }],
  });

  if (request.customer) {
    await notify({
      user: request.customer,
      type: 'request_confirmed',
      title: 'Service request received',
      message: `We have logged ${request.trackingCode}. A dispatcher will review it shortly.`,
      link: '/dashboard/customer/requests',
    });
  }

  await notifyRole(['dispatcher', 'admin'], {
    type: priority === 'emergency' ? 'system' : 'request_confirmed',
    title: priority === 'emergency' ? 'EMERGENCY request received' : 'New service request',
    message: `${contact.name} — ${request.title} (${request.trackingCode})`,
    link: '/dashboard/dispatcher',
  });

  res.status(201).json({ success: true, data: request });
});

export const listServiceRequests = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: FilterQuery<ServiceRequestDoc> = {};

  if (user.role === 'customer') filter.customer = user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.serviceType) filter.serviceType = req.query.serviceType;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim(), 'i');
    Object.assign(filter, {
      $or: [{ trackingCode: rx }, { title: rx }, { 'contact.name': rx }, { 'contact.email': rx }],
    });
  }

  const requests = await ServiceRequest.find(filter)
    .populate('customer', 'name email phone avatarUrl')
    .populate('quotation', 'quoteNumber status total')
    .populate('job', 'jobNumber status scheduledStart technician')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, count: requests.length, data: requests });
});

export const getServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate('customer', 'name email phone avatarUrl customer')
    .populate('quotation')
    .populate({
      path: 'job',
      populate: { path: 'technician', select: 'name phone avatarUrl technician' },
    });

  if (!request) throw ApiError.notFound('Service request not found');

  const user = req.user!;
  if (user.role === 'customer' && String(request.customer?._id ?? request.customer) !== user.id) {
    throw ApiError.forbidden();
  }

  res.json({ success: true, data: request });
});

/** Public status lookup — no auth, keyed on the short tracking code. */
export const trackServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const code = String(req.params.code).trim().toUpperCase();
  const request = await ServiceRequest.findOne({ trackingCode: code })
    .populate({ path: 'job', select: 'jobNumber status scheduledStart technician', populate: { path: 'technician', select: 'name' } })
    .populate('quotation', 'quoteNumber status total validUntil');

  if (!request) throw ApiError.notFound('No request found for that tracking code');

  res.json({
    success: true,
    data: {
      trackingCode: request.trackingCode,
      title: request.title,
      serviceType: request.serviceType,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt,
      preferredDate: request.preferredDate,
      city: request.address.city,
      timeline: request.timeline,
      job: request.job,
      quotation: request.quotation,
      customerName: request.contact.name,
    },
  });
});

export const updateRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body;
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Service request not found');

  request.status = status;
  request.timeline.push({ status, note, at: new Date(), by: req.user!._id });
  await request.save();

  if (request.customer) {
    await notify({
      user: request.customer,
      type: 'system',
      title: `Request ${request.trackingCode} updated`,
      message: note || `Status changed to ${String(status).replace('_', ' ')}.`,
      link: '/dashboard/customer/requests',
    });
  }

  res.json({ success: true, data: request });
});

export const cancelServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Service request not found');

  const user = req.user!;
  if (user.role === 'customer' && String(request.customer) !== user.id) throw ApiError.forbidden();
  if (['completed', 'in_progress'].includes(request.status)) {
    throw ApiError.badRequest('Work has already started — please call dispatch to cancel');
  }

  request.status = 'cancelled';
  request.timeline.push({
    status: 'cancelled',
    note: req.body.reason || 'Cancelled by customer',
    at: new Date(),
    by: user._id,
  });
  await request.save();

  await notifyRole(['dispatcher'], {
    type: 'system',
    title: 'Request cancelled',
    message: `${request.trackingCode} was cancelled.`,
    link: '/dashboard/dispatcher',
  });

  res.json({ success: true, data: request });
});

/** Links a guest-submitted request to the signed-in customer account. */
export const claimServiceRequest = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  if (user.role !== 'customer') throw ApiError.forbidden('Only customers can claim a request');

  const request = await ServiceRequest.findOne({
    trackingCode: String(req.body.trackingCode).trim().toUpperCase(),
  });
  if (!request) throw ApiError.notFound('No request found for that tracking code');
  if (request.customer) throw ApiError.conflict('That request is already linked to an account');
  if (request.contact.email.toLowerCase() !== user.email.toLowerCase()) {
    throw ApiError.forbidden('That request was submitted with a different email address');
  }

  request.customer = user._id;
  await request.save();
  await User.findByIdAndUpdate(user._id, {});

  res.json({ success: true, data: request });
});
