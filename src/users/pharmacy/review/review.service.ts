import { InferSchemaType, Types } from 'mongoose';

import {
  MedicineReviewModel,
  MedicineReviewSchema,
  Pagination,
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

  async getReviews(
    filter: Pagination,
    pharmacyId: string | Types.ObjectId,
    userId?: string | Types.ObjectId,
  ) {
    return ReviewModel.find({
      pharmacy: pharmacyId,
      ...(userId != null && { user: userId }),
    })
      .skip((filter.page - 1) * filter.count)
      .limit(filter.count)
      .populate('user', 'fullName')
      .sort('-createdAt');
  }

  async delReview(userId: string, reviewId: string) {
    const review = await ReviewModel.findOne({
      user: userId,
      _id: reviewId,
    });

    if (review == null) return false;

    const pharmacy = await pharmacyService.getPharmacy(review.pharmacy);

    if (pharmacy == null) return false;

    const totalRatings = pharmacy.ratingsCount * pharmacy.rating;
    const newTotalRating = totalRatings - review.rate;
    pharmacy.ratingsCount -= 1;

    if (pharmacy.ratingsCount == 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      pharmacy.rating = null;
    } else {
      pharmacy.rating = newTotalRating / pharmacy.ratingsCount;
    }

    await pharmacy.save();
    await ReviewModel.deleteOne({ user: userId, _id: reviewId });

    return true;
  }

  async writeMedicineReview(
    userId: string | Types.ObjectId,
    medicineId: string | Types.ObjectId,
    review: Omit<
      InferSchemaType<typeof MedicineReviewSchema>,
      'user' | 'medicine' | 'createdAt' | 'updatedAt'
    >,
  ) {
    const medicine = await pharmacyService.getMedicine(medicineId);

    if (medicine == null) return false;

    await new MedicineReviewModel({
      user: userId,
      medicine: medicineId,
      message: review.message,
    }).save();

    return true;
  }

  async getMedicineReviews(
    filter: Pagination,
    medicineId: string | Types.ObjectId,
    userId?: string | Types.ObjectId,
  ) {
    return MedicineReviewModel.find({
      medicine: medicineId,
      ...(userId != null && { user: userId }),
    })
      .skip((filter.page - 1) * filter.count)
      .limit(filter.count)
      .populate('user', 'fullName')
      .sort('-createdAt');
  }

  async delMedicineReviews(userId: string, reviewIds: string[]) {
    return MedicineReviewModel.deleteMany({
      $and: [
        { user: userId },
        {
          _id: {
            $in: reviewIds,
          },
        },
      ],
    });
  }
}

export default new ReviewService();
