import * as Yup from 'yup';

import { UserSession } from '@/users/user.model';
import {
  MedicineReviewDto,
  ReviewDto,
} from '@/users/pharmacy/review/review.validator';
import reviewService from '@/users/pharmacy/review/review.service';
import { NotFoundError } from '@/utils/HttpError';

class ReviewController {
  async writeReview(
    this: void,
    session: UserSession,
    review: Yup.InferType<typeof ReviewDto>,
  ) {
    const result = await reviewService.writeReview(
      session.id,
      review.pharmacy_id,
      {
        content: review.content,
        rate: review.rate,
      },
    );

    if (!result) throw new NotFoundError('Pharmacy not found.');
  }

  async writeMedicineReview(
    this: void,
    session: UserSession,
    review: Yup.InferType<typeof MedicineReviewDto>,
  ) {
    const result = await reviewService.writeMedicineReview(
      session.id,
      review.medicine_id,
      {
        message: review.message,
      },
    );

    if (!result) throw new NotFoundError('Medicine not found.');
  }
}

export default new ReviewController();
