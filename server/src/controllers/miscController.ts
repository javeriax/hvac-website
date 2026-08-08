import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { Notification } from '../models/Notification';
import { ContactMessage } from '../models/ContactMessage';
import { Equipment } from '../models/Equipment';
import { Testimonial } from '../models/Testimonial';
import { notifyRole } from '../services/notify';

/* ---------------------------------- notifications --------------------------------- */

// The notification feed plus an unread count for the bell.
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { user: req.user!._id };
  if (req.query.unread === 'true') filter.read = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(Number(req.query.limit) || 50),
    Notification.countDocuments({ user: req.user!._id, read: false }),
  ]);

  res.json({ success: true, data: { notifications, unreadCount } });
});

// Marks one notification read.
export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user!._id },
    { read: true, readAt: new Date() },
    { new: true },
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json({ success: true, data: notification });
});

// Clears the whole unread count.
export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { user: req.user!._id, read: false },
    { read: true, readAt: new Date() },
  );
  res.json({ success: true, message: 'All caught up' });
});

/* ------------------------------------ contact ------------------------------------- */

// Website contact form. Drops into the admin inbox and pings admins.
export const submitContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    throw ApiError.badRequest('Name, email and message are required');
  }

  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    subject: subject || 'General enquiry',
    message,
  });

  await notifyRole(['admin'], {
    type: 'system',
    title: 'New contact enquiry',
    message: `${name}: ${doc.subject}`,
    link: '/dashboard/admin/messages',
  });

  res.status(201).json({ success: true, data: { id: doc.id }, message: 'Thanks, we will be in touch shortly.' });
});

// The contact inbox.
export const listContactMessages = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;

  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, count: messages.length, data: messages });
});

// Moves a message between new / read / responded / archived.
export const updateContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, data: message });
});

/* ----------------------------------- equipment ------------------------------------ */

// Equipment catalogue, used by the quote builder search.
export const listEquipment = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).trim(), 'i');
    Object.assign(filter, { $or: [{ name: rx }, { sku: rx }, { brand: rx }] });
  }

  const equipment = await Equipment.find(filter).sort({ category: 1, name: 1 });
  res.json({ success: true, count: equipment.length, data: equipment });
});

// Admin adding or editing a catalogue item.
export const upsertEquipment = asyncHandler(async (req: Request, res: Response) => {
  const item = req.params.id
    ? await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    : await Equipment.create(req.body);
  if (!item) throw ApiError.notFound('Equipment not found');
  res.json({ success: true, data: item });
});

/* ---------------------------------- testimonials ---------------------------------- */

// Published testimonials for the public site.
export const listTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const testimonials = await Testimonial.find({ isPublished: true }).sort({ createdAt: -1 }).limit(24);
  res.json({ success: true, data: testimonials });
});

// A customer leaving a review. It goes in unpublished so an admin can read it
// before it appears on the marketing site, and each customer only gets one.
export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { rating, quote, serviceType } = req.body;

  const score = Number(rating);
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    throw ApiError.badRequest('Please choose a rating between 1 and 5 stars');
  }
  if (!quote || String(quote).trim().length < 20) {
    throw ApiError.badRequest('Please write at least 20 characters so the review is useful');
  }

  const existing = await Testimonial.findOne({ customer: user._id });
  if (existing) {
    throw ApiError.conflict('You have already left a review. Contact us if you want it changed.');
  }

  const testimonial = await Testimonial.create({
    author: user.name,
    role: user.customer?.propertyType === 'commercial' ? 'Business customer' : 'Homeowner',
    city: user.customer?.address?.city ?? 'Phoenix',
    rating: score,
    quote: String(quote).trim(),
    serviceType: serviceType || 'maintenance',
    customer: user._id,
    isPublished: false,
  });

  await notifyRole(['admin'], {
    type: 'system',
    title: 'New customer review awaiting approval',
    message: `${user.name} left a ${score}-star review.`,
    link: '/dashboard/admin/reviews',
  });

  res.status(201).json({ success: true, data: testimonial });
});

// Lets the review form know whether this customer has already written one.
export const getMyTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const mine = await Testimonial.findOne({ customer: req.user!._id });
  res.json({ success: true, data: mine });
});

// Admin moderation queue: everything, including reviews not yet published.
export const listAllTestimonials = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status === 'pending') filter.isPublished = false;
  if (req.query.status === 'published') filter.isPublished = true;

  const testimonials = await Testimonial.find(filter)
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, count: testimonials.length, data: testimonials });
});

// Admin publishing or hiding a review.
export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isPublished: Boolean(req.body.isPublished) },
    { new: true },
  );
  if (!testimonial) throw ApiError.notFound('Review not found');
  res.json({ success: true, data: testimonial });
});
