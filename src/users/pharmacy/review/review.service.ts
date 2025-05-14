import { InferSchemaType, Types } from 'mongoose';

import {
  ReviewModel,
  ReviewSchema,
} from '@/users/pharmacy/review/review.model';
import pharmacyService from '@/users/pharmacy/pharmacy.service';

class ReviewService {
  async writeReview(
    userId: string | Types.ObjectId,
    pharmacyId: string | Types.ObjectId,
    review: Omit<
      InferSchemaType<typeof ReviewSchema>,
      'user' | 'pharmacy' | 'createdAt' | 'updatedAt'
    >,
  ) {
    const pharmacy = await pharmacyService.getPharmacy(pharmacyId);

    if (pharmacy == null) return false;

    const oldReview = await ReviewModel.findOne({
      user: userId,
      pharmacy: pharmacyId,
    });

    if (oldReview == null) {
      // add new rating
      if (pharmacy.ratingsCount === 0) {
        pharmacy.rating = review.rate;
      } else {
        pharmacy.rating =
          (pharmacy.rating * pharmacy.ratingsCount + review.rate) /
          (pharmacy.ratingsCount + 1);
      }

      pharmacy.ratingsCount += 1;

      await new ReviewModel({
        user: userId,
        pharmacy: pharmacyId,
        rate: review.rate,
        content: review.content,
      }).save();
    } else {
      // adjust rating
      pharmacy.rating =
        (pharmacy.rating * pharmacy.ratingsCount -
          oldReview.rate +
          review.rate) /
        pharmacy.ratingsCount;

      oldReview.rate = review.rate;
      oldReview.content = review.content;
      await oldReview.save();
    }

    await pharmacy.save();

    return true;
  }
}

export default new ReviewService();
