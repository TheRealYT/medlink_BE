import { Router } from 'express';

import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';
import { body, pass, query } from '@/utils/parser';
import {
  MedicineReviewDelDto,
  MedicineReviewDto,
  MedicineReviewFilterDto,
  ReviewDelDto,
  ReviewDto,
  ReviewFilterDto,
} from '@/users/pharmacy/review/review.validator';
import reviewController from '@/users/pharmacy/review/review.controller';

const router = Router();
const customerGuard = userGuard(UserType.CUSTOMER);

// put any authenticated user accessible routes here

router.post(
  '/review/write',
  customerGuard,
  body(ReviewDto),
  pass(reviewController.writeReview),
);

router.delete(
  '/review',
  customerGuard,
  body(ReviewDelDto),
  pass(reviewController.delReview),
);

router.get(
  '/reviews',
  customerGuard,
  query(ReviewFilterDto),
  pass(reviewController.getReviews),
);

router.get(
  '/medicine/reviews',
  customerGuard,
  query(MedicineReviewFilterDto),
  pass(reviewController.getMedicineReviews),
);

router.delete(
  '/medicine/reviews',
  customerGuard,
  body(MedicineReviewDelDto),
  pass(reviewController.delMedicineReviews),
);

router.post(
  '/medicine/review/write',
  customerGuard,
  body(MedicineReviewDto),
  pass(reviewController.writeMedicineReview),
);

export default router;
