import { Document, Model, Schema, Types, model } from 'mongoose';

export interface ContactMessageDoc extends Document<Types.ObjectId> {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true },
);

export const ContactMessage: Model<ContactMessageDoc> = model<ContactMessageDoc>(
  'ContactMessage',
  contactMessageSchema,
);
