class AuthService {
  // get a signup otp cache key
  getSignupOtpKey(email: string, role: string) {
    return `${email}-${role}-reg-otp`;
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
