import express, { Router } from 'express';

import { pass } from '@/utils/parser';
import authGuard from '@/auth/auth.guard';
import userController from '@/users/user.controller';
import customerRouter from '@/users/customer/customer.router';
import pharmacyRouter from '@/users/pharmacy/pharmacy.router';
import { PROFILE_DIR } from '@/config/constants';

const router = Router();

router.use('/image', express.static(PROFILE_DIR));

router.get('/profile', authGuard(), pass(userController.getProfile));

router.use('/customer', customerRouter);

router.use('/pharmacy', pharmacyRouter);

export default router;
