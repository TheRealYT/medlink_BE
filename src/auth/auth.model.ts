import { UserType } from '@/users/user.model';

export type SignupUserInfo = {
  full_name: string;
  email: string;
  password: string;
  userType: UserType;
  otpHash: string;
};
