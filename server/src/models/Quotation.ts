import { Document, Model, Schema, Types, model } from 'mongoose';

export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const LINE_KINDS = ['labor', 'equipment', 'part', 'fee'] as const;
export type LineKind = (typeof LINE_KINDS)[number];

export interface LineItem {
  kind: LineKind;
  description: string;
  quantity: number;
  unitPrice: number;
  equipment?: Types.ObjectId;
}

export interface QuotationDoc extends Document<Types.ObjectId> {
  quoteNumber: string;
  serviceRequest: Types.ObjectId;
  customer: Types.ObjectId;
  lineItems: LineItem[];
  laborTotal: number;
  equipmentTotal: number;
  subtotal: number;
  discountType: 'none' | 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  validUntil: Date;
  notes?: string;
  terms?: string;
  rejectionReason?: string;
  sentAt?: Date;
  respondedAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  recalculate(): void;
}

const lineItemSchema = new Schema<LineItem>(
  {
    kind: { type: String, enum: LINE_KINDS, required: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
  },
  { _id: false },
);

const quotationSchema = new Schema<QuotationDoc>(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },
    serviceRequest: { type: Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lineItems: { type: [lineItemSchema], default: [] },
    laborTotal: { type: Number, default: 0 },
    equipmentTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discountType: { type: String, enum: ['none', 'percent', 'fixed'], default: 'none' },
    discountValue: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 8.25, min: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: QUOTE_STATUSES, default: 'draft', index: true },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    notes: String,
    terms: {
      type: String,
      default:
        'Quotation valid for 30 days. Work begins after written approval. Parts carry a 12-month manufacturer warranty; labour is warranted for 90 days.',
    },
    rejectionReason: String,
    sentAt: Date,
    respondedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Recomputes every derived money field from the line items. */
quotationSchema.methods.recalculate = function recalculate(this: QuotationDoc) {
  const sumOf = (kinds: LineKind[]) =>
    this.lineItems
      .filter((li) => kinds.includes(li.kind))
      .reduce((acc, li) => acc + li.quantity * li.unitPrice, 0);

  this.laborTotal = round2(sumOf(['labor']));
  this.equipmentTotal = round2(sumOf(['equipment', 'part']));
  this.subtotal = round2(this.lineItems.reduce((a, li) => a + li.quantity * li.unitPrice, 0));

  if (this.discountType === 'percent') {
    this.discountAmount = round2((this.subtotal * this.discountValue) / 100);
  } else if (this.discountType === 'fixed') {
    this.discountAmount = round2(Math.min(this.discountValue, this.subtotal));
  } else {
    this.discountAmount = 0;
  }

  const taxable = Math.max(this.subtotal - this.discountAmount, 0);
  this.taxAmount = round2((taxable * this.taxRate) / 100);
  this.total = round2(taxable + this.taxAmount);
};

quotationSchema.pre('validate', function autoTotals(next) {
  this.recalculate();
  next();
});

export const Quotation: Model<QuotationDoc> = model<QuotationDoc>('Quotation', quotationSchema);
