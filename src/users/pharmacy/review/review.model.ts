import { model, Schema } from 'mongoose';

import { UserModel } from '@/users/user.model';
import { PharmacyModel } from '@/users/pharmacy/pharmacy.model';

export const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: PharmacyModel,
      required: true,
    },
    content: String,
    rate: {
      type: Number, // [1, 5]
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ReviewModel = model('Review', ReviewSchema);
