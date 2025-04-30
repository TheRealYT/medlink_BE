import { Router } from 'express';

import { body, pass, query } from '@/utils/parser';
import pharmacyController from '@/users/pharmacy/pharmacy.controller';
import {
  PharmacyFilterDto,
  PharmacyProfileDto,
} from '@/users/pharmacy/pharmacy.validator';
import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';
import authGuard from '@/auth/auth.guard';
import {
  MedicineDto,
  MedicineItemsDto,
} from '@/users/pharmacy/medicine.validator';
import profileGuard from '@/users/pharmacy/profile.guard';

const router = Router();

// put publicly accessible routes here

router.use(authGuard());

// put any authenticated user accessible routes here

router.post('/find', body(PharmacyFilterDto), pass(pharmacyController.find));

router.use(userGuard(UserType.PHARMACIST));

// put pharmacist only routes here

router.get('/profile/status', pass(pharmacyController.getProfileStatus));

router.get('/profile', pass(pharmacyController.getProfile));

router.put(
  '/medicine/add',
  profileGuard(),
  body(MedicineDto),
  pass(pharmacyController.addMedicine),
);

router.get(
  '/medicines',
  profileGuard(),
  query(MedicineItemsDto),
  pass(pharmacyController.getMedicines),
);

router.post(
  '/profile',
  body(PharmacyProfileDto),
  pass(pharmacyController.setProfile),
);

export default router;
