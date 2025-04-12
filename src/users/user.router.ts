import { Router } from 'express';

import { pass } from '@/utils/parser';
import authGuard from '@/auth/auth.guard';
import userController from '@/users/user.controller';

const router = Router();

router.post('/profile', authGuard(), pass(userController.getProfile));

export default router;
