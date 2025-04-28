import { Router } from 'express';

import { body, pass } from '@/utils/parser';
import { CustomerProfileDto } from '@/users/customer/customer.validator';
import customerController from '@/users/customer/customer.controller';
import authGuard from '@/auth/auth.guard';
import userGuard from '@/users/user.guard';
import { UserType } from '@/users/user.model';

const router = Router();

// put publicly accessible routes here

router.use(authGuard());

// put any authenticated user accessible routes here

router.use(userGuard(UserType.CUSTOMER));

// put customer only routes here

router.get('/profile', pass(customerController.getProfile));

router.post(
  '/profile',
  body(CustomerProfileDto),
  pass(customerController.setProfile),
);

export default router;
