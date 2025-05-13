import { model, Schema } from 'mongoose';

import { UserModel } from '@/users/user.model';

export enum HealthCondition {
  Diabetes = 'diabetes',
  Hypertension = 'hypertension',
  Pregnancy = 'pregnancy',
  Asthma = 'asthma',
  Allergies = 'allergies',
  Heart_Disease = 'heart_disease',
  Epilepsy = 'epilepsy',
  Cancer = 'cancer',
  Chronic_Kidney_Disease = 'chronic_kidney_disease',
  Thyroid_Disorder = 'thyroid_disorder',
  Mental_Health_Condition = 'mental_health_condition',
  Arthritis = 'arthritis',
  Chronic_Pain = 'chronic_pain',
  HIV_AIDS = 'HIV_AIDS',
  Vision_Impairment = 'vision_impairment',
  Hearing_Impairment = 'hearing_impairment',
  Mobility_Issues = 'mobility_issues',
  Lung_Disease = 'lung_disease ',
  Liver_Disease = 'liver_disease',
}

export const OnlyHealthCondition: Partial<Record<HealthCondition, 'M' | 'F'>> =
  {
    [HealthCondition.Pregnancy]: 'F',
  };

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
    gender: {
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
