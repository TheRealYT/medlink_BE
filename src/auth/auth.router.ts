import { Router } from 'express';

import { body, pass } from '@/utils/parser';
import { LoginDto, SignupDto, VerifyEmailDto } from '@/auth/auth.validator';
import authController from '@/auth/auth.controller';

const router = Router();

router.post('/signup', body(SignupDto), pass(authController.signup));

router.post(
  '/signup-verify',
  body(VerifyEmailDto),
  pass(authController.verifyEmail),
);

router.post('/login', body(LoginDto), pass(authController.login));

export default router;
