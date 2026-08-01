import { Document, Model, Schema, Types, model } from 'mongoose';

export interface MaintenancePlanDoc extends Document<Types.ObjectId> {
  slug: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  visitsPerYear: number;
  responseHours: number;
  repairDiscountPercent: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const maintenancePlanSchema = new Schema<MaintenancePlanDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    priceMonthly: { type: Number, required: true, min: 0 },
    priceAnnual: { type: Number, required: true, min: 0 },
    visitsPerYear: { type: Number, required: true, min: 1 },
    responseHours: { type: Number, default: 24 },
    repairDiscountPercent: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MaintenancePlan: Model<MaintenancePlanDoc> = model<MaintenancePlanDoc>(
  'MaintenancePlan',
  maintenancePlanSchema,
);
