import { Router } from 'express';

import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';
import authGuard from '@/auth/auth.guard';
import { body, pass } from '@/utils/parser';
import {
  MedicineReviewDto,
  ReviewDto,
} from '@/users/pharmacy/review/review.validator';
import reviewController from '@/users/pharmacy/review/review.controller';

const router = Router();

// put publicly accessible routes here

router.use(authGuard());

// put any authenticated user accessible routes here

router.use(userGuard(UserType.CUSTOMER));

// put customer only routes here

router.post(
  '/review/write',
  body(ReviewDto),
  pass(reviewController.writeReview),
);

router.post(
  '/medicine/review/write',
  body(MedicineReviewDto),
  pass(reviewController.writeMedicineReview),
);

export default router;
