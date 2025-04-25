import { Router } from 'express';

import { body, pass } from '@/utils/parser';
import pharmacyController from '@/users/pharmacy/pharmacy.controller';
import { PharmacyProfileDto } from '@/users/pharmacy/pharmacy.validator';

const router = Router();

router.get('/profile', pass(pharmacyController.getProfile));

router.post(
  '/profile',
  body(PharmacyProfileDto),
  pass(pharmacyController.setProfile),
);

export default router;
