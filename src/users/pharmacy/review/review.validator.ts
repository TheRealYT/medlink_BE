import * as Yup from 'yup';

import { ObjectIdValidator } from '@/users/user.validator';

export const ReviewDto = Yup.object({
  pharmacy_id: ObjectIdValidator.required(),
  content: Yup.string().min(10).max(2000).optional(),
  rate: Yup.number().integer().min(1).max(5).required(),
});

export const ReviewFilterDto = Yup.object({
  pharmacy_id: ObjectIdValidator.required(),
  count: Yup.number().integer().positive().default(3).max(10).optional(),
  page: Yup.number().integer().positive().default(1).optional(),
  my: Yup.boolean().default(false).optional(),
});

export const MedicineReviewDto = Yup.object({
  medicine_id: ObjectIdValidator.required(),
  message: Yup.string().min(1).max(2000).required(),
});

export const MedicineReviewFilterDto = Yup.object({
  medicine_id: ObjectIdValidator.required(),
  count: Yup.number().integer().positive().default(3).max(10).optional(),
  page: Yup.number().integer().positive().default(1).optional(),
  my: Yup.boolean().default(false).optional(),
});

export const MedicineReviewDelDto = Yup.object({
  ids: Yup.array()
    .of(ObjectIdValidator.required())
    .min(1, 'At least one review id is required')
    .required('Review ids is required'),
});

export const ReviewDelDto = Yup.object({
  id: ObjectIdValidator.required('Review ids is required'),
});
