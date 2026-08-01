import { Document, Model, Schema, Types, model } from 'mongoose';
import { LineItem } from './Quotation';

export const INVOICE_STATUSES = [
  'draft',
  'sent',
  'partial',
  'paid',
  'overdue',
  'void',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface InvoiceDoc extends Document<Types.ObjectId> {
  invoiceNumber: string;
  customer: Types.ObjectId;
  job?: Types.ObjectId;
  quotation?: Types.ObjectId;
  contract?: Types.ObjectId;
  lineItems: LineItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  recalculate(): void;
}

const lineItemSchema = new Schema<LineItem>(
  {
    kind: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  },
  { _id: false },
);

const invoiceSchema = new Schema<InvoiceDoc>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    quotation: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    contract: { type: Schema.Types.ObjectId, ref: 'MaintenanceContract' },
    lineItems: { type: [lineItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 8.25 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: INVOICE_STATUSES, default: 'draft', index: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
    paidAt: Date,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const round2 = (n: number) => Math.round(n * 100) / 100;

invoiceSchema.methods.recalculate = function recalculate(this: InvoiceDoc) {
  this.subtotal = round2(this.lineItems.reduce((a, li) => a + li.quantity * li.unitPrice, 0));
  const taxable = Math.max(this.subtotal - this.discountAmount, 0);
  this.taxAmount = round2((taxable * this.taxRate) / 100);
  this.total = round2(taxable + this.taxAmount);
  this.balance = round2(Math.max(this.total - this.amountPaid, 0));

  if (this.status !== 'void' && this.status !== 'draft') {
    if (this.balance <= 0) {
      this.status = 'paid';
      this.paidAt = this.paidAt ?? new Date();
    } else if (this.amountPaid > 0) {
      this.status = 'partial';
    } else if (this.dueDate.getTime() < Date.now()) {
      this.status = 'overdue';
    }
  }
};

invoiceSchema.pre('validate', function autoTotals(next) {
  this.recalculate();
  next();
});

export const Invoice: Model<InvoiceDoc> = model<InvoiceDoc>('Invoice', invoiceSchema);
