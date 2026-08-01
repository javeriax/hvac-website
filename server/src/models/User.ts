import bcrypt from 'bcryptjs';
import { Document, Model, Schema, Types, model } from 'mongoose';

export const ROLES = ['customer', 'technician', 'dispatcher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const TECH_STATUS = ['available', 'on_job', 'off_duty', 'on_leave'] as const;
export type TechStatus = (typeof TECH_STATUS)[number];

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface CustomerProfile {
  address: Address;
  propertyType: 'residential' | 'commercial';
  companyName?: string;
  customerSince: Date;
  preferredContact: 'phone' | 'email' | 'sms';
}

export interface TechnicianProfile {
  employeeId: string;
  skills: string[];
  certifications: string[];
  serviceAreas: string[];
  status: TechStatus;
  rating: number;
  jobsCompleted: number;
  hourlyRate: number;
  shiftStart: string; // "08:00"
  shiftEnd: string; // "17:00"
  hiredAt: Date;
}

export interface UserDoc extends Document<Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  customer?: CustomerProfile;
  technician?: TechnicianProfile;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<Address>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ROLES, required: true, default: 'customer', index: true },
    avatarUrl: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,

    customer: {
      type: new Schema<CustomerProfile>(
        {
          address: { type: addressSchema, required: true },
          propertyType: {
            type: String,
            enum: ['residential', 'commercial'],
            default: 'residential',
          },
          companyName: String,
          customerSince: { type: Date, default: Date.now },
          preferredContact: {
            type: String,
            enum: ['phone', 'email', 'sms'],
            default: 'email',
          },
        },
        { _id: false },
      ),
      required: false,
    },

    technician: {
      type: new Schema<TechnicianProfile>(
        {
          employeeId: String,
          skills: [String],
          certifications: [String],
          serviceAreas: [String],
          status: { type: String, enum: TECH_STATUS, default: 'available' },
          rating: { type: Number, default: 5, min: 0, max: 5 },
          jobsCompleted: { type: Number, default: 0 },
          hourlyRate: { type: Number, default: 85 },
          shiftStart: { type: String, default: '08:00' },
          shiftEnd: { type: String, default: '17:00' },
          hiredAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      required: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret.password;
    return ret;
  },
} as never);

export const User: Model<UserDoc> = model<UserDoc>('User', userSchema);
