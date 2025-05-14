import { model, Schema } from 'mongoose';

import { UserModel } from '@/users/user.model';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type PharmacyContext = {
  id: string;
  verified: boolean;
};

export type PharmacyFilter = {
  name?: string;
  address?: string;
  location?: { lat: number; lng: number; distance: number };
  openHour?: { close?: string; day: string; open?: string };
  delivery?: boolean;
  rating?: number;
  next: number;
};

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
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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
            type: Number, // in minutes
            required: true,
          },
          close: {
            type: Number, // in minutes
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
    rating: {
      type: Number,
      default: null, // null -> unrated, or 1-5
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

PharmacySchema.index({ location: '2dsphere' });

export const PharmacyModel = model('Pharmacy', PharmacySchema);
