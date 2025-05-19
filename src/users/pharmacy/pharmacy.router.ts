import { Router } from 'express';

import { body, enumToStr, param, pass, query } from '@/utils/parser';
import pharmacyController from '@/users/pharmacy/pharmacy.controller';
import {
  PharmacyFilterDto,
  PharmacyIdDto,
  PharmacyProfileDto,
} from '@/users/pharmacy/pharmacy.validator';
import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';
import authGuard from '@/auth/auth.guard';
import {
  MedicineAIDto,
  MedicineDelDto,
  MedicineDto,
  MedicineEditDto,
  MedicineFilterDto,
  MedicineIdDto,
  MedicineItemsDto,
} from '@/users/pharmacy/medicine.validator';
import profileGuard from '@/users/pharmacy/profile.guard';
import {
  MedicineCategories,
  MedicineForms,
} from '@/users/pharmacy/modicine.model';
import reviewRouter from '@/users/pharmacy/review/review.router';

const router = Router();

// put publicly accessible routes here

router.get('/medicine/forms', enumToStr(MedicineForms));

router.get('/medicine/categories', enumToStr(MedicineCategories));

router.use(authGuard());

// put any authenticated user accessible routes here

router.use(reviewRouter);

router.get(
  '/detail/:pharmacy_id',
  param(PharmacyIdDto),
  pass(pharmacyController.getPharmacy),
);

router.post('/find', body(PharmacyFilterDto), pass(pharmacyController.find));

router.post(
  '/medicine/search',
  body(MedicineFilterDto),
  pass(pharmacyController.searchMedicine),
);

router.get(
  '/medicine/:medicine_id',
  param(MedicineIdDto),
  pass(pharmacyController.getMedicine),
);

router.post(
  '/medicine/ask-ai',
  body(MedicineAIDto),
  pass(pharmacyController.getMedicineAI),
);

router.use(userGuard(UserType.PHARMACIST));

// put pharmacist only routes here

router.get('/profile/status', pass(pharmacyController.getProfileStatus));

router.get('/profile', pass(pharmacyController.getProfile));

router.post(
  '/profile',
  body(PharmacyProfileDto),
  pass(pharmacyController.setProfile),
);

router.use(profileGuard());

// put routes that require a pharmacy profile

router.put(
  '/medicine',
  body(MedicineDto),
  pass(pharmacyController.addMedicine),
);

router.patch(
  '/medicine',
  body(MedicineEditDto),
  pass(pharmacyController.editMedicine),
);

router.delete(
  '/medicine',
  body(MedicineDelDto),
  pass(pharmacyController.delMedicines),
);

router.get(
  '/medicines',
  query(MedicineItemsDto),
  pass(pharmacyController.getMedicines),
);

export default router;
