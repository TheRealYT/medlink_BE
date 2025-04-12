import { UserType } from '@/users/user.model';

class AuthService {
  // get a signup otp cache key
  getSignupOtpKey(email: string, userType: UserType) {
    return `${email}-${userType}-reg-otp`;
  }

  // get an access token cache key
  getAccessTokenKey(token: string) {
    return `access-${token}`;
  }

  // get a refresh token cache key
  getRefreshTokenKey(token: string) {
    return `refresh-${token}`;
  }
}

export default new AuthService();
