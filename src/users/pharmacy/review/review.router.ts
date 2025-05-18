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

// put any authenticated user accessible routes here

router.use(userGuard(UserType.CUSTOMER));

// put customer only routes here

router.post(
  '/review/write',
  body(ReviewDto),
  pass(reviewController.writeReview),
);

router.delete('/review', body(ReviewDelDto), pass(reviewController.delReview));

router.get(
  '/reviews',
  query(ReviewFilterDto),
  pass(reviewController.getReviews),
);

router.get(
  '/medicine/reviews',
  query(MedicineReviewFilterDto),
  pass(reviewController.getMedicineReviews),
);

router.delete(
  '/medicine/reviews',
  body(MedicineReviewDelDto),
  pass(reviewController.delMedicineReviews),
);

router.post(
  '/medicine/review/write',
  body(MedicineReviewDto),
  pass(reviewController.writeMedicineReview),
);

export default router;
