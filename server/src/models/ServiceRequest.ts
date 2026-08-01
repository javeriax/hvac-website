import { Document, Model, Schema, Types, model } from 'mongoose';
import { Address } from './User';

export const SERVICE_TYPES = [
  'installation',
  'repair',
  'maintenance',
  'inspection',
  'duct-cleaning',
  'thermostat',
  'emergency',
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const REQUEST_STATUSES = [
  'submitted',
  'reviewing',
  'quoted',
  'approved',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const PRIORITIES = ['low', 'normal', 'high', 'emergency'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface TimelineEntry {
  status: string;
  note?: string;
  at: Date;
  by?: Types.ObjectId;
}

export interface ServiceRequestDoc extends Document<Types.ObjectId> {
  trackingCode: string;
  customer?: Types.ObjectId;
  contact: { name: string; email: string; phone: string };
  serviceType: ServiceType;
  propertyType: 'residential' | 'commercial';
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  preferredDate?: Date;
  preferredWindow?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  address: Address;
  photos: { url: string; publicId?: string; caption?: string }[];
  systemAge?: string;
  systemBrand?: string;
  timeline: TimelineEntry[];
  quotation?: Types.ObjectId;
  job?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<ServiceRequestDoc>(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    contact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    serviceType: { type: String, enum: SERVICE_TYPES, required: true, index: true },
    propertyType: { type: String, enum: ['residential', 'commercial'], default: 'residential' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: PRIORITIES, default: 'normal', index: true },
    status: { type: String, enum: REQUEST_STATUSES, default: 'submitted', index: true },
    preferredDate: Date,
    preferredWindow: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime',
    },
    address: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    photos: [
      {
        _id: false,
        url: { type: String, required: true },
        publicId: String,
        caption: String,
      },
    ],
    systemAge: String,
    systemBrand: String,
    timeline: [
      {
        _id: false,
        status: { type: String, required: true },
        note: String,
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    quotation: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
  },
  { timestamps: true },
);

serviceRequestSchema.index({ createdAt: -1 });

export const ServiceRequest: Model<ServiceRequestDoc> = model<ServiceRequestDoc>(
  'ServiceRequest',
  serviceRequestSchema,
);
