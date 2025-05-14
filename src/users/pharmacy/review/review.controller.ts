import * as Yup from 'yup';

import { UserSession } from '@/users/user.model';
import { ReviewDto } from '@/users/pharmacy/review/review.validator';
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
}

export default new ReviewController();
