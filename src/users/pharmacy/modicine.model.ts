import { model, Schema } from 'mongoose';

import { PharmacyModel } from '@/users/pharmacy/pharmacy.model';

export const MedicineForms = ['tablet', 'syrup', 'injection', 'cream'];

export const MedicineCategories = [
  'paracetamol',
  'ibuprofen',
  'amoxicillin',
  'azithromycin',
  'metformin',
  'atorvastatin',
  'omeprazole',
  'cetirizine',
  'cough syrup',
  'pain reliever',
  'antibiotic',
  'antacid',
  'antihistamine',
  'diabetes',
  'hypertension',
  'vitamin',
  'multivitamin',
  'cough suppressant',
  'fever reducer',
  'antiseptic',
  'anti-inflammatory',
  'antifungal',
];

export type MedicineAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

export type MedicineFilter = {
  pharmacyId?: string;
  name: string;
  category?: string;
  form?: string;
  dosage?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: MedicineAvailability;
  prescriptionRequired?: boolean;
  manufacturer?: string;
  next: number;
};

export const MedicineSchema = new Schema(
  {
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: PharmacyModel,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    dosage: {
      type: String,
      required: true,
    },
    form: {
      type: String,
      enum: MedicineForms,
      required: true,
    },
    category: {
      type: String,
      enum: MedicineCategories,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    batchNumber: String,
    manufacturedDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    prescriptionRequired: {
      type: Boolean,
      required: true,
    },
    manufacturer: String,
    storageInstructions: String,
    stockThreshold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const MedicineModel = model('Medicine', MedicineSchema);
