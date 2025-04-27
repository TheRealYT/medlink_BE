import * as Yup from 'yup';

import { UserType } from '@/users/user.model';

const email = Yup.string().email().required();

const user_type = Yup.mixed<UserType>()
  .oneOf(Object.values(UserType) as UserType[])
  .required();

const strongPassword = Yup.string()
  .min(8, 'Password must be at least 8 characters long')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/\d/, 'Password must contain at least one number')
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character',
  )
  .required('Password is required');

export const VerifyEmailDto = Yup.object().shape({
  email,
  user_type,
  otp_code: Yup.string()
    .matches(/^\d{6}$/, 'Must be a 6-digit number') // otp generator must do the same length
    .required('OTP code is required'),
});

export const SignupDto = Yup.object().shape({
  full_name: Yup.string()
    .matches(
      /^[a-zA-Z]{3,} [a-zA-Z]{3,}$/,
      'Enter your full name with exactly two words',
    )
    .max(50, 'Full name cannot exceed 50 characters')
    .required('Full name is required'),
  email,
  password: strongPassword,
  user_type,
});

export const LoginDto = Yup.object().shape({
  email,
  user_type,
  password: Yup.string().required(),
  remember_me: Yup.boolean().default(false),
});

export const ForgetPassDto = Yup.object().shape({
  email,
  user_type,
});

export const ResetPassDto = Yup.object().shape({
  email,
  user_type,
  password: strongPassword,
  token: Yup.string().required(),
});
