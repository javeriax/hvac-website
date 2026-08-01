import { Document, Model, Schema, Types, model } from 'mongoose';

export const CONTRACT_STATUSES = [
  'pending',
  'active',
  'expiring',
  'expired',
  'cancelled',
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export interface ContractVisit {
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  job?: Types.ObjectId;
  completedAt?: Date;
  notes?: string;
}

export interface MaintenanceContractDoc extends Document<Types.ObjectId> {
  contractNumber: string;
  customer: Types.ObjectId;
  plan: Types.ObjectId;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  autoRenew: boolean;
  visitsTotal: number;
  visitsUsed: number;
  visits: ContractVisit[];
  remindersSent: { type: string; at: Date }[];
  renewedFrom?: Types.ObjectId;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  daysRemaining: number;
  refreshStatus(): void;
}

const maintenanceContractSchema = new Schema<MaintenanceContractDoc>(
  {
    contractNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: 'MaintenancePlan', required: true },
    planName: { type: String, required: true },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'annual' },
    amount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: { type: String, enum: CONTRACT_STATUSES, default: 'active', index: true },
    autoRenew: { type: Boolean, default: true },
    visitsTotal: { type: Number, required: true },
    visitsUsed: { type: Number, default: 0 },
    visits: [
      {
        _id: false,
        scheduledDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'missed', 'rescheduled'],
          default: 'scheduled',
        },
        job: { type: Schema.Types.ObjectId, ref: 'Job' },
        completedAt: Date,
        notes: String,
      },
    ],
    // `type` is a field name here, so it needs an explicit sub-schema —
    // inline it and Mongoose reads it as the array's type declaration instead.
    remindersSent: {
      type: [
        new Schema(
          { type: { type: String, required: true }, at: { type: Date, default: Date.now } },
          { _id: false },
        ),
      ],
      default: [],
    },
    renewedFrom: { type: Schema.Types.ObjectId, ref: 'MaintenanceContract' },
    cancelledAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

maintenanceContractSchema.virtual('daysRemaining').get(function daysRemaining(
  this: MaintenanceContractDoc,
) {
  return Math.ceil((this.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

/** Contracts inside the 60-day renewal window are flagged so admins can chase them. */
maintenanceContractSchema.methods.refreshStatus = function refreshStatus(
  this: MaintenanceContractDoc,
) {
  if (this.status === 'cancelled' || this.status === 'pending') return;
  const days = Math.ceil((this.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) this.status = 'expired';
  else if (days <= 60) this.status = 'expiring';
  else this.status = 'active';
};

export const MaintenanceContract: Model<MaintenanceContractDoc> = model<MaintenanceContractDoc>(
  'MaintenanceContract',
  maintenanceContractSchema,
);
