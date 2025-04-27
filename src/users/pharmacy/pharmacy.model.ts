import { model, Schema } from 'mongoose';

import { UserModel } from '@/users/user.model';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// pharmacy profile
export const PharmacySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pharmacyName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    openHours: {
      type: [
        {
          day: {
            type: String,
            enum: DAYS,
            required: true,
          },
          open: {
            type: String,
            required: true,
          },
          close: {
            type: String,
            required: true,
          },
        },
      ],
      _id: false,
      required: true,
    },
    website: {
      type: String,
    },
    personName: {
      type: String,
    },
    pharmacyLogo: {
      type: String,
    },
    delivery: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rejectionMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const PharmacyModel = model('Pharmacy', PharmacySchema);
