class AuthService {
  // get a signup otp cache key
  getSignupOtpKey(email: string, role: string) {
    return `${email}-${role}-reg-otp`;
  }
}

export default new AuthService();
