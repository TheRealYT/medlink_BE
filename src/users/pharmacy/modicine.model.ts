import { model, Schema } from 'mongoose';

import { PharmacyModel } from '@/users/pharmacy/pharmacy.model';

export enum MedicineForms {
  Tablet = 'tablet',
  Syrup = 'syrup',
  Injection = 'injection',
  Cream = 'cream',
}

export enum MedicineCategories {
  Paracetamol = 'paracetamol',
  Ibuprofen = 'ibuprofen',
  Amoxicillin = 'amoxicillin',
  Azithromycin = 'azithromycin',
  Metformin = 'metformin',
  Atorvastatin = 'atorvastatin',
  Omeprazole = 'omeprazole',
  Cetirizine = 'cetirizine',
  Cough_Syrup = 'cough_syrup',
  Pain_Reliever = 'pain_reliever',
  Antibiotic = 'antibiotic',
  Antacid = 'antacid',
  Antihistamine = 'antihistamine',
  Diabetes = 'diabetes',
  Hypertension = 'hypertension',
  Vitamin = 'vitamin',
  Multivitamin = 'multivitamin',
  Cough_Suppressant = 'cough_suppressant',
  Fever_Reducer = 'fever_reducer',
  Antiseptic = 'antiseptic',
  Anti_Inflammatory = 'anti-inflammatory',
  Antifungal = 'antifungal',
}

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
