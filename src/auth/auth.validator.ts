import Yup from 'yup';

import { UserType } from '@/users/user.model';

const email = Yup.string().email().required();

const userType = Yup.mixed<UserType>()
  .oneOf(Object.values(UserType) as UserType[])
  .required();

export const VerifyEmailDto = Yup.object().shape({
  email,
  userType,
  otp_code: Yup.string()
    .min(4, 'Code must be at least 4 characters long')
    .required(),
});

export const SignupDto = Yup.object().shape({
  full_name: Yup.string()
    .min(3, 'Full name must be at least 3 characters long')
    .max(50, 'Full name cannot exceed 50 characters')
    .required('Full name is required'),
  email,
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    )
    .required('Password is required'),
  userType,
});

export const LoginDto = Yup.object().shape({
  email,
  userType,
  password: Yup.string().required(),
  remember_me: Yup.boolean().default(false),
});
