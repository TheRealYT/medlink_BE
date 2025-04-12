import { UserType } from '@/users/user.model';

export type SignupUserInfo = {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  otpHash: string;
};
