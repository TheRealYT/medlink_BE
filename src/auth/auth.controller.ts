import Yup from 'yup';
import dayjs from 'dayjs';

import authService from '@/auth/auth.service';
import cacheService from '@/cache/cache.service';
import cryptoService from '@/crypto/crypto.service';
import userService from '@/users/user.service';
import {
  BadRequestError,
  ErrorCodes,
  UnauthorizedError,
} from '@/utils/HttpError';
import { SendEmailDto, SignupDto, VerifyEmailDto } from '@/auth/auth.validator';
import { UserRole } from '@/users/user.model';

const OTP_RESEND = 2; // in minutes
const OTP_EXPIRY = 5; // in minutes
const REG_TOKEN_EXPIRY = 24; // in hours

class AuthController {
  async sendEmailCode(data: Yup.InferType<typeof SendEmailDto>) {
    const key = authService.getSignupOtpKey(data.email, data.role);

    // check if otp exists
    if (await cacheService.has(key)) {
      const timeLeft = await cacheService.getTimeLeft(key);
      if (timeLeft) {
        const now = dayjs();
        const expiryTime = now.add(timeLeft, 'seconds');

        // check if the threshold time has passed for resend
        const resend = dayjs().isAfter(expiryTime.add(OTP_RESEND, 'minutes'));

        if (!resend)
          throw new BadRequestError(
            'Code already sent, try after a few moments.',
          );
      }
    }

    // check email first to avoid delay from time calculations
    const otp = await cryptoService.generateOTP(6);
    const hash = await cryptoService.hash(otp);

    const now = dayjs();
    const resend = now.add(OTP_RESEND, 'minutes');
    const expiry = now.add(OTP_EXPIRY, 'minutes');

    // TODO: send email
    console.log(otp);
    const ttl = expiry.diff(now, 'seconds');
    await cacheService.set(key, hash, ttl);

    // return uniform response to prevent email enumeration or guessing
    return {
      message: 'A verification code has been sent to your email address.',
      data: {
        expires_at: expiry.valueOf(),
        resend_at: resend.valueOf(),
      },
    };
  }

  // TODO: add rate limiting
  async verifyEmail(data: Yup.InferType<typeof VerifyEmailDto>) {
    const key = authService.getSignupOtpKey(data.email, data.role);
    const hash = await cacheService.get(key);

    // check if otp exists
    if (hash && (await cryptoService.compare(data.code, hash))) {
      const token = await cryptoService.generateSessionId();
      const now = dayjs();
      const tokenExpiry = now.add(REG_TOKEN_EXPIRY, 'hours');

      const ttl = tokenExpiry.diff(now, 'seconds');

      const value = {
        email: data.email,
        role: data.role,
      };

      await cacheService.setJSON(token, value, ttl);
      await cacheService.del(key);

      return {
        data: {
          signup_token: token,
          type: 'Bearer',
          expires_at: tokenExpiry.valueOf(),
        },
      };
    }

    // no information disclosure about non-existing email
    throw new BadRequestError('Incorrect code.');
  }

  async signup(data: Yup.InferType<typeof SignupDto>, token: string) {
    const user = await cacheService.getJSON<{ email: string; role: UserRole }>(
      token,
    );
    if (user) {
      await cacheService.del(token);

      // safe to tell email existence
      if (await userService.emailExists(user.email, user.role))
        throw new BadRequestError(
          'Email address already exists.',
          ErrorCodes.EMAIL_EXISTS,
        );

      await userService.register({ ...data, ...user });

      return {
        statusCode: 201,
      };
    }

    throw new UnauthorizedError(
      'Authorization required.',
      ErrorCodes.AUTH_REQUIRED,
    );
  }
}

export default new AuthController();
