import { Router } from 'express';

import { body, pass, token } from '@/utils/parser';
import {
  LoginDto,
  SendEmailDto,
  SignupDto,
  VerifyEmailDto,
} from '@/auth/auth.validator';
import authController from '@/auth/auth.controller';

const router = Router();

router.post(
  '/email-code',
  body(SendEmailDto),
  pass(authController.sendEmailCode),
);

router.post(
  '/email-verify',
  body(VerifyEmailDto),
  pass(authController.verifyEmail),
);

router.post(
  '/signup',
  body(SignupDto),
  token('Bearer'),
  pass(authController.signup),
);

router.post('/login', body(LoginDto), pass(authController.login));

export default router;
