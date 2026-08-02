import { Types } from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';

interface NotifyInput {
  user: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  meta?: Record<string, unknown>;
}

/**
 * Every notification in the app is created through here (module 9).
 *
 * Keeping it in one place stops the bell, the customer portal and the admin feed
 * drifting apart, and it is the single spot to add email or SMS later.
 */
export async function notify(input: NotifyInput) {
  if (!input.user) return null;
  return Notification.create({
    user: input.user,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
    meta: input.meta,
  });
}

/** Fans a notification out to every user holding one of the given roles. */
export async function notifyRole(
  roles: Array<'admin' | 'dispatcher' | 'technician' | 'customer'>,
  payload: Omit<NotifyInput, 'user'>,
) {
  const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id').lean();
  if (!users.length) return [];
  return Notification.insertMany(
    users.map((u) => ({ ...payload, user: u._id })),
  );
}
