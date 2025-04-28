import { Router } from 'express';

import { body, pass } from '@/utils/parser';
import pharmacyController from '@/users/pharmacy/pharmacy.controller';
import { PharmacyProfileDto } from '@/users/pharmacy/pharmacy.validator';
import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';
import authGuard from '@/auth/auth.guard';

const router = Router();

// put publicly accessible routes here

router.use(authGuard());

// put any authenticated user accessible routes here

router.use(userGuard(UserType.PHARMACIST));

// put pharmacist only routes here

router.get('/profile', pass(pharmacyController.getProfile));

router.post(
  '/profile',
  body(PharmacyProfileDto),
  pass(pharmacyController.setProfile),
);

export default router;
