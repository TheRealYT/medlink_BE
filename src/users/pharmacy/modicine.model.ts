import { model, Schema } from 'mongoose';

import { PharmacyModel } from '@/users/pharmacy/pharmacy.model';

export enum MedicineForms {
  Tablet = 'tablet',
  Syrup = 'syrup',
  Injection = 'injection',
  Cream = 'cream',
}

export enum MedicineCategories {
  Pain_Reliever = 'pain_reliever', // includes paracetamol, ibuprofen, etc.
  Cold_and_Flu = 'cold_and_flu',
  Antibiotic = 'antibiotic', // includes amoxicillin, azithromycin, etc.
  Antacid = 'antacid', // includes omeprazole, etc.
  Antihistamine = 'antihistamine', // includes cetirizine, etc.
  Cough_Suppressant = 'cough_suppressant', // includes cough syrups
  Fever_Reducer = 'fever_reducer', // includes NSAIDs, acetaminophen, etc.
  Antiseptic = 'antiseptic', // includes iodine, alcohol-based solutions
  Anti_Inflammatory = 'anti_inflammatory', // includes NSAIDs
  Antifungal = 'antifungal', // includes clotrimazole, fluconazole, etc.
  Antiviral = 'antiviral', // includes acyclovir, oseltamivir, etc.
  Antidiabetic = 'antidiabetic', // includes metformin, insulin, etc.
  Antihypertensive = 'antihypertensive', // includes beta blockers, ACE inhibitors, etc.
  Vitamin = 'vitamin', // Single vitamins like B12, D, C, etc.
  Multivitamin = 'multivitamin', // Combined vitamin supplements
  Gastrointestinal = 'gastrointestinal', // includes treatments for ulcers, IBS, etc.
  Respiratory = 'respiratory', // includes bronchodilators, expectorants
  Cardiovascular = 'cardiovascular', // includes statins, heart medications
  Dermatological = 'dermatological', // Creams, ointments for skin conditions
  Neurological = 'neurological', // Seizure meds, migraine treatments
  Psychiatric = 'psychiatric', // Antidepressants, antipsychotics, etc.
  Mineral_Supplement = 'mineral_supplement', // for calcium, magnesium, zinc, etc.
}

export type MedicineAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

export type MedicineFilter = {
  pharmacyId?: string;
  name?: string;
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
    image: String,
  },
  {
    timestamps: true,
  },
);

export const MedicineModel = model('Medicine', MedicineSchema);
