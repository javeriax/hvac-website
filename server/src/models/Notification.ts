import { Document, Model, Schema, Types, model } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'request_confirmed',
  'technician_assigned',
  'appointment_reminder',
  'quotation_sent',
  'quotation_approved',
  'quotation_rejected',
  'invoice_generated',
  'payment_received',
  'maintenance_due',
  'contract_renewal',
  'job_completed',
  'system',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationDoc extends Document<Types.ObjectId> {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: Date;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification: Model<NotificationDoc> = model<NotificationDoc>(
  'Notification',
  notificationSchema,
);
