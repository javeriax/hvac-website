import { Document, Model, Schema, Types, model } from 'mongoose';
import { Address } from './User';
import { Priority, ServiceType } from './ServiceRequest';

export const JOB_STATUSES = [
  'unassigned',
  'assigned',
  'en_route',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface JobPhoto {
  url: string;
  publicId?: string;
  caption?: string;
  phase: 'before' | 'after';
  uploadedAt: Date;
}

export interface JobDoc extends Document<Types.ObjectId> {
  jobNumber: string;
  serviceRequest: Types.ObjectId;
  quotation?: Types.ObjectId;
  contract?: Types.ObjectId;
  customer: Types.ObjectId;
  technician?: Types.ObjectId;
  title: string;
  serviceType: ServiceType;
  priority: Priority;
  status: JobStatus;
  address: Address;
  scheduledStart: Date;
  scheduledEnd: Date;
  startedAt?: Date;
  completedAt?: Date;
  checklist: { label: string; done: boolean }[];
  photos: JobPhoto[];
  report?: {
    summary: string;
    workPerformed: string;
    partsUsed: { name: string; quantity: number }[];
    recommendations?: string;
    laborHours: number;
    submittedAt: Date;
  };
  signature?: { url: string; signedBy: string; signedAt: Date };
  notes: { text: string; by?: Types.ObjectId; at: Date }[];
  timeline: { status: string; note?: string; at: Date; by?: Types.ObjectId }[];
  invoice?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDoc>(
  {
    jobNumber: { type: String, required: true, unique: true, index: true },
    serviceRequest: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    quotation: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    contract: { type: Schema.Types.ObjectId, ref: 'MaintenanceContract' },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    technician: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    serviceType: { type: String, required: true },
    priority: { type: String, default: 'normal', index: true },
    status: { type: String, enum: JOB_STATUSES, default: 'unassigned', index: true },
    address: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    scheduledStart: { type: Date, required: true, index: true },
    scheduledEnd: { type: Date, required: true },
    startedAt: Date,
    completedAt: Date,
    checklist: [{ _id: false, label: String, done: { type: Boolean, default: false } }],
    photos: [
      {
        _id: false,
        url: { type: String, required: true },
        publicId: String,
        caption: String,
        phase: { type: String, enum: ['before', 'after'], default: 'before' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    report: {
      type: new Schema(
        {
          summary: { type: String, required: true },
          workPerformed: { type: String, required: true },
          partsUsed: [{ _id: false, name: String, quantity: Number }],
          recommendations: String,
          laborHours: { type: Number, default: 1 },
          submittedAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      required: false,
    },
    signature: {
      type: new Schema(
        {
          url: { type: String, required: true },
          signedBy: { type: String, required: true },
          signedAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      required: false,
    },
    notes: [
      {
        _id: false,
        text: { type: String, required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        _id: false,
        status: { type: String, required: true },
        note: String,
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true },
);

jobSchema.index({ technician: 1, scheduledStart: 1 });

export const Job: Model<JobDoc> = model<JobDoc>('Job', jobSchema);
