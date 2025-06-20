import * as Yup from 'yup';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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
import {
  ForgetPassDto,
  LoginDto,
  ResetPassDto,
  SignupDto,
  VerifyEmailDto,
} from '@/auth/auth.validator';
import { UserSession } from '@/users/user.model';
import { SignupUserInfo } from '@/auth/auth.model';
import emailService from '@/email/email.service';
import emailTemplates from '@/email/email.templates';
import { logger } from '@/utils';
import { getEnv } from '@/config';
import { TIME } from '@/common/types';

dayjs.extend(relativeTime);

// ensure time consistency
const OTP_RESEND: TIME = [2, 'minutes'];
const OTP_EXPIRY: TIME = [5, 'minutes'];
const ACCESS_TOKEN_EXPIRY: TIME = [24, 'hours'];
const REFRESH_TOKEN_EXPIRY: TIME = [30, 'days'];

class AuthController {
  async signup(this: void, data: Yup.InferType<typeof SignupDto>) {
    const key = authService.getSignupOtpKey(data.email, data.user_type);

    // check if otp exists
    if (await cacheService.has(key)) {
      const timeLeft = await cacheService.getTimeLeft(key);
      if (timeLeft) {
        const now = dayjs();
        const expiryTime = now.add(timeLeft, 'seconds');

        // check if the threshold time has passed for resend
        const sentTime = expiryTime.subtract(...OTP_EXPIRY);
        const resend = dayjs().isAfter(sentTime.add(...OTP_RESEND));

        if (!resend)
          throw new BadRequestError(
            'A verification code already sent to your email, resend after a few moments or check your inbox.',
          );
      }
    }

    if (await userService.userExists(data.email, data.user_type)) {
      const message = 'Email already exists.';

      throw new BadRequestError(message, ErrorCodes.EMAIL_EXISTS, {
        email: message,
      });
    }

    // check email first to avoid delay from time calculations
    const otp = await cryptoService.generateOTP(6);
    const hash = await cryptoService.hash(otp);

    const now = dayjs();
    const resend = now.add(...OTP_RESEND);
    const expiry = now.add(...OTP_EXPIRY);

    const message = await emailTemplates.useTemplate(
      'signup_verification',
      otp,
      expiry.fromNow(true),
    );
    emailService
      .send(data.email, message)
      .catch((err) =>
        logger.error('Failed to send signup verification email:', err),
      );

    const value: SignupUserInfo = {
      fullName: data.full_name,
      email: data.email,
      userType: data.user_type,
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
  async verifyEmail(this: void, data: Yup.InferType<typeof VerifyEmailDto>) {
    const key = authService.getSignupOtpKey(data.email, data.user_type);
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

  async login(this: void, data: Yup.InferType<typeof LoginDto>) {
    const user = await userService.findUser(data.email, data.user_type);
    const key = authService.getSignupOtpKey(data.email, data.user_type);

    // check if email is on signup verification
    if (await cacheService.has(key))
      throw new BadRequestError(
        'Please goto signup page to complete account registration first.',
      );

    if (
      user != null &&
      (await cryptoService.compare(data.password, user.password))
    ) {
      const now = dayjs();

      // generate access token
      const accessToken = await cryptoService.generateSessionId();
      const accessTokenExpiry = now.add(...ACCESS_TOKEN_EXPIRY);

      const session: UserSession = {
        id: user._id.toString(),
        userType: user.userType,
        accessToken,
      };

      if (data.remember_me) {
        // generate refreshToken for longer sessions
        const refreshToken = await cryptoService.generateSessionId();
        const refreshTokenExpiry = now.add(...REFRESH_TOKEN_EXPIRY);

        // add to session cache object
        session.refreshToken = refreshToken;

        await cacheService.setJSON(
          authService.getRefreshTokenKey(refreshToken),
          session,
          refreshTokenExpiry.diff(now, 'seconds'),
        );
      }

      await cacheService.setJSON(
        authService.getAccessTokenKey(accessToken),
        session,
        accessTokenExpiry.diff(now, 'seconds'),
      );

      return {
        data: {
          access_token: accessToken,
          refresh_token: session.refreshToken,
          type: 'Bearer',
          expires_at: accessTokenExpiry.valueOf(),
          user_type: user.userType,
        },
      };
    }

    throw new AccessDeniedError(
      'Incorrect email or password.',
      ErrorCodes.INVALID_CREDENTIALS,
    );
  }

  async refreshToken(this: void, session: UserSession) {
    // generate a new access token
    const accessToken = await cryptoService.generateSessionId();

    const now = dayjs();
    const accessTokenExpiry = now.add(...ACCESS_TOKEN_EXPIRY);

    const value: UserSession = {
      ...session,
      accessToken, // replace by the new access token
    };

    // add access token to cache
    await cacheService.setJSON(
      authService.getAccessTokenKey(accessToken),
      value,
      accessTokenExpiry.diff(now, 'seconds'),
    );

    // update refresh token cache
    await cacheService.setJSON(
      authService.getRefreshTokenKey(<string>session.refreshToken),
      value,
    );

    return {
      data: {
        access_token: accessToken,
        type: 'Bearer',
        expires_at: accessTokenExpiry.valueOf(),
        user_type: session.userType,
      },
    };
  }

  async logout(this: void, session: UserSession) {
    const keys = [authService.getAccessTokenKey(session.accessToken)];

    if (session.refreshToken != null) {
      keys.push(authService.getRefreshTokenKey(session.refreshToken));
    }

    await cacheService.del(...keys);
  }

  async forgetPassword(this: void, data: Yup.InferType<typeof ForgetPassDto>) {
    const tokenKey = authService.getPassResetTokenKey(
      data.email,
      data.user_type,
    );
    const otpKey = authService.getPassResetOtpKey(data.email, data.user_type);

    // check if both token and otp exist
    if (await cacheService.has(tokenKey, otpKey)) {
      const timeLeft = await cacheService.getTimeLeft(tokenKey);
      if (timeLeft) {
        const now = dayjs();
        const expiryTime = now.add(timeLeft, 'seconds');

        // check if the threshold time has passed for resend
        const sentTime = expiryTime.subtract(...OTP_EXPIRY);
        const resend = dayjs().isAfter(sentTime.add(...OTP_RESEND));

        if (!resend)
          throw new BadRequestError(
            'A password reset link already sent to your email, resend after a few moments or check your inbox.',
          );
      }
    }

    const user = await userService.findUser(data.email, data.user_type);

    if (user == null) {
      const message = "Account doesn't exist.";

      throw new NotFoundError(message, undefined, {
        email: message,
      });
    }

    const token = await cryptoService.generateSessionId();
    const otpCode = await cryptoService.generateOTP(6);

    const now = dayjs();
    const expiry = now.add(...OTP_EXPIRY);
    const resend = now.add(...OTP_RESEND);

    const link = `${getEnv('FRONTEND_URL')}/reset-password/${token}`;
    const message = await emailTemplates.useTemplate(
      'password_reset',
      link,
      otpCode,
      expiry.fromNow(true),
    );
    emailService
      .send(data.email, message)
      .catch((err) => logger.error('Failed to send password reset link:', err));

    const ttl = expiry.diff(now, 'seconds');
    await cacheService.set(tokenKey, token, ttl);
    await cacheService.set(otpKey, otpCode, ttl);

    return {
      message: 'A password reset link has been sent to your email address.',
      data: {
        expires_at: expiry.valueOf(),
        resend_at: resend.valueOf(),
      },
    };
  }

  async resetPassword(this: void, data: Yup.InferType<typeof ResetPassDto>) {
    const tokenKey = authService.getPassResetTokenKey(
      data.email,
      data.user_type,
    );
    const otpKey = authService.getPassResetOtpKey(data.email, data.user_type);

    if (data.token != null) {
      const token = await cacheService.get(tokenKey);

      if (token == null || token !== data.token)
        throw new BadRequestError('Invalid or expired password reset link.');
    } else if (data.otp_code != null) {
      const otpCode = await cacheService.get(otpKey);

      if (otpCode == null || otpCode !== data.otp_code)
        throw new BadRequestError('Invalid or expired OTP code.');
    } else {
      throw new BadRequestError(
        'Please use either OTP code or a password reset link.',
      );
    }

    const user = await userService.setPassword(
      data.email,
      data.user_type,
      data.password,
    );

    if (user == null)
      throw new BadRequestError('Invalid or expired password reset link.');

    await cacheService.del(tokenKey, otpKey);
  }
}

export default new AuthController();
