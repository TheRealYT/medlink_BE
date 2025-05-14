import * as Yup from 'yup';

import { ObjectIdValidator } from '@/users/user.validator';

export const ReviewDto = Yup.object({
  pharmacy_id: ObjectIdValidator.required(),
  content: Yup.string().min(30).max(2000).optional(),
  rate: Yup.number().integer().min(1).max(5).required(),
});
