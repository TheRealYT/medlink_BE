import { model, Schema } from 'mongoose';

export type UserSession = {
  id: string;
  email: string;
  userType: UserType;
};

export enum UserType {
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
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', UserSchema);
