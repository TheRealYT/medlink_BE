import { Router } from 'express';

import { body, pass } from '@/utils/parser';
import { CustomerProfileDto } from '@/users/customer/customer.validator';
import customerController from '@/users/customer/customer.controller';

const router = Router();

router.get('/profile', pass(customerController.getProfile));

router.post(
  '/profile',
  body(CustomerProfileDto),
  pass(customerController.setProfile),
);

export default router;
