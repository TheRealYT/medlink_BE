import { UserType } from '@/users/user.model';

class AuthService {
  // get a signup otp cache key
  getSignupOtpKey(email: string, userType: UserType) {
    return `${email}-${userType}-reg-otp`;
  }

  // get an access token cache key
  getAccessTokenKey(this: void, token: string) {
    return `access-${token}`;
  }

  // get a refresh token cache key
  getRefreshTokenKey(this: void, token: string) {
    return `refresh-${token}`;
  }

  getPassResetTokenKey(email: string, userType: UserType) {
    return `${email}-${userType}-pass-token`;
  }

  getPassResetOtpKey(email: string, userType: UserType) {
    return `${email}-${userType}-pass-otp`;
  }
}

export default new AuthService();
