import { Document, Model, Schema, Types, model } from 'mongoose';

export interface TestimonialDoc extends Document<Types.ObjectId> {
  author: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
  serviceType: string;
  isPublished: boolean;
  // Set when a signed-in customer wrote it. Seeded demo reviews have no author
  // account, which is also how we stop one person leaving ten reviews.
  customer?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<TestimonialDoc>(
  {
    author: { type: String, required: true, trim: true },
    role: { type: String, default: 'Homeowner' },
    city: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    quote: { type: String, required: true },
    serviceType: { type: String, default: 'maintenance' },
    isPublished: { type: Boolean, default: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true },
);

export const Testimonial: Model<TestimonialDoc> = model<TestimonialDoc>(
  'Testimonial',
  testimonialSchema,
);
