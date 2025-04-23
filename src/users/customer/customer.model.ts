import { model, Schema } from 'mongoose';

import { UserModel } from '@/users/user.model';

export enum HealthCondition {
  DIABETES = 'diabetes',
  HYPERTENSION = 'hypertension',
  PREGNANCY = 'pregnancy',
}

// customer profile
export const CustomerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    alternatePhoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    profilePicture: {
      type: String,
    },
    healthDetails: {
      type: [String],
      enum: Object.values(HealthCondition),
    },
  },
  {
    timestamps: true,
  },
);

export const CustomerModel = model('Customer', CustomerSchema);
