import { model, Schema } from 'mongoose';

import { PharmacyModel } from '@/users/pharmacy/pharmacy.model';

export const MedicineForms = ['tablet', 'syrup', 'injection', 'cream'];

export const MedicineSchema = new Schema(
  {
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: PharmacyModel,
      required: true,
      unique: true,
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
