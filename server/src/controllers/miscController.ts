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
