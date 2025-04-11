import { Schema, model } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'customer',
  PHARMACIST = 'pharmacist',
}

export const UserSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const UserModel = model('User', UserSchema);
