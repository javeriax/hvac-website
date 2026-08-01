import { Document, Model, Schema, Types, model } from 'mongoose';

export const EQUIPMENT_CATEGORIES = [
  'ac-unit',
  'furnace',
  'heat-pump',
  'thermostat',
  'air-handler',
  'ductwork',
  'filter',
  'part',
] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

/** `model` is omitted from Document because the schema uses it as a data field. */
export interface EquipmentDoc extends Omit<Document<Types.ObjectId>, 'model'> {
  sku: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  modelNumber?: string;
  description?: string;
  unitPrice: number;
  unit: string;
  stock: number;
  reorderLevel: number;
  specs: { label: string; value: string }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<EquipmentDoc>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: EQUIPMENT_CATEGORIES, required: true, index: true },
    brand: { type: String, required: true, trim: true },
    modelNumber: String,
    description: String,
    unitPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'each' },
    stock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 5 },
    specs: [{ _id: false, label: String, value: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Equipment: Model<EquipmentDoc> = model<EquipmentDoc>('Equipment', equipmentSchema);
