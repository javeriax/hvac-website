import { Document, Model, Schema, Types, model } from 'mongoose';

export const PAYMENT_METHODS = [
  'card',
  'cash',
  'check',
  'bank_transfer',
  'online',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface PaymentDoc extends Document<Types.ObjectId> {
  paymentNumber: string;
  invoice: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  reference?: string;
  paidAt: Date;
  recordedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    paymentNumber: { type: String, required: true, unique: true, index: true },
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'succeeded',
    },
    reference: String,
    paidAt: { type: Date, default: Date.now, index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Payment: Model<PaymentDoc> = model<PaymentDoc>('Payment', paymentSchema);
