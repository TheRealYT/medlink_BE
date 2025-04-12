import Yup from 'yup';
import dayjs from 'dayjs';

import authService from '@/auth/auth.service';
import cacheService from '@/cache/cache.service';
import cryptoService from '@/crypto/crypto.service';
import userService from '@/users/user.service';
import {
  AccessDeniedError,
  BadRequestError,
  ErrorCodes,
  NotFoundError,
} from '@/utils/HttpError';
import { LoginDto, SignupDto, VerifyEmailDto } from '@/auth/auth.validator';
import { UserSession } from '@/users/user.model';
import { SignupUserInfo } from '@/auth/auth.model';

const OTP_RESEND = 2; // in minutes
const OTP_EXPIRY = 5; // in minutes
const ACCESS_TOKEN_EXPIRY = 24; // in hours
const REFRESH_TOKEN_EXPIRY = 30; // in days

class AuthController {
  async signup(data: Yup.InferType<typeof SignupDto>) {
    const key = authService.getSignupOtpKey(data.email, data.userType);

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
            'A verification code already sent to your email, resend after a few moments or check your inbox.',
          );
      }
    }

    if (await userService.userExists(data.email, data.userType)) {
      const message = 'Email already exists.';

      throw new BadRequestError(message, ErrorCodes.EMAIL_EXISTS, {
        email: message,
      });
    }

    // check email first to avoid delay from time calculations
    const otp = await cryptoService.generateOTP(6);
    const hash = await cryptoService.hash(otp);

    const now = dayjs();
    const resend = now.add(OTP_RESEND, 'minutes');
    const expiry = now.add(OTP_EXPIRY, 'minutes');

    // TODO: send email
    console.log(otp);

    const value: SignupUserInfo = {
      ...data,
      password: await cryptoService.hash(data.password),
      otpHash: hash,
    };
    const ttl = expiry.diff(now, 'seconds');
    await cacheService.setJSON(key, value, ttl);

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
    const key = authService.getSignupOtpKey(data.email, data.userType);
    const user = await cacheService.getJSON<SignupUserInfo>(key);

    // check if otp exists
    if (user == null)
      throw new NotFoundError(
        "Verification doesn't exist, it is either expired or completed.",
      );

    if (await cryptoService.compare(data.otp_code, user.otpHash)) {
      await cacheService.del(key);
      await userService.register({ ...user });

      return {
        statusCode: 201,
      };
    }

    const message = 'Incorrect otp code.';
    throw new BadRequestError(message, undefined, {
      otp_code: message,
    });
  }

  async login(data: Yup.InferType<typeof LoginDto>) {
    const user = await userService.findUser(data.email, data.userType);
    const key = authService.getSignupOtpKey(data.email, data.userType);

    // check if email is on signup verification
    if (await cacheService.has(key))
      throw new BadRequestError(
        'Please goto signup page to complete account registration first.',
      );

    if (
      user != null &&
      (await cryptoService.compare(data.password, user.password))
    ) {
      const [accessToken, refreshToken] = [
        await cryptoService.generateSessionId(),
        await cryptoService.generateSessionId(),
      ];

      const now = dayjs();
      const accessTokenExpiry = now.add(ACCESS_TOKEN_EXPIRY, 'hours');
      const refreshTokenExpiry = now.add(REFRESH_TOKEN_EXPIRY, 'days');

      const value: UserSession = {
        id: user._id.toString(),
        email: user.email,
        userType: user.userType,
      };

      await cacheService.setJSON(
        authService.getAccessTokenKey(accessToken),
        value,
        accessTokenExpiry.diff(now, 'seconds'),
      );
      await cacheService.setJSON(
        authService.getRefreshTokenKey(refreshToken),
        value,
        refreshTokenExpiry.diff(now, 'seconds'),
      );

      return {
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
          type: 'Bearer',
          expires_at: accessTokenExpiry.valueOf(),
          userType: user.userType,
        },
      };
    }

    throw new AccessDeniedError(
      'Incorrect email or password.',
      ErrorCodes.INVALID_CREDENTIALS,
    );
  }
}

export default new AuthController();
