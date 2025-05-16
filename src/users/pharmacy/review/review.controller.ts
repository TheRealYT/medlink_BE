import * as Yup from 'yup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { UserSession } from '@/users/user.model';
import {
  MedicineReviewDto,
  MedicineReviewFilterDto,
  ReviewDto,
  ReviewFilterDto,
} from '@/users/pharmacy/review/review.validator';
import reviewService from '@/users/pharmacy/review/review.service';
import { NotFoundError } from '@/utils/HttpError';

dayjs.extend(relativeTime);

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

  async getReviews(
    this: void,
    session: UserSession,
    filter: Yup.InferType<typeof ReviewFilterDto>,
  ) {
    const result = await reviewService.getReviews(
      {
        page: filter.page,
        count: filter.count,
      },
      filter.pharmacy_id,
      filter.my ? session.id : undefined,
    );

    return {
      data: result.map((r) => ({
        id: r._id.toString(),
        name: (r.user as unknown as { fullName: string }).fullName,
        content: r.content ?? null,
        rate: r.rate,
        date: dayjs(r.createdAt).fromNow(),
        my: r.user._id.toString() == session.id,
      })),
    };
  }

  async getMedicineReviews(
    this: void,
    session: UserSession,
    filter: Yup.InferType<typeof MedicineReviewFilterDto>,
  ) {
    const result = await reviewService.getMedicineReviews(
      {
        page: filter.page,
        count: filter.count,
      },
      filter.medicine_id,
      filter.my ? session.id : undefined,
    );

    return {
      data: result.map((r) => ({
        id: r._id.toString(),
        name: (r.user as unknown as { fullName: string }).fullName,
        message: r.message,
        date: dayjs(r.createdAt).fromNow(),
        my: r.user._id.toString() == session.id,
      })),
    };
  }
}

export default new ReviewController();
