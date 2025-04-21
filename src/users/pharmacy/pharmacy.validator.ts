import * as Yup from 'yup';

import { DAYS } from '@/users/pharmacy/pharmacy.model';

const phoneRegex = /^[+]?[0-9]{7,15}$/;
const zipCodeRegex = /^[0-9]{4,10}$/;
const stateCityRegex = /^[a-zA-Z\s\-']{2,50}$/;

const phoneNumber = Yup.string().matches(
  phoneRegex,
  'Phone number must be valid',
);

const address = {
  street: Yup.string().min(2).max(100),
  city: Yup.string().matches(stateCityRegex, 'City must be valid'),
  state: Yup.string().matches(stateCityRegex, 'State must be valid'),
  zip_code: Yup.string().matches(zipCodeRegex, 'ZIP code must be valid'),
};

const openHours = Yup.array()
  .of(
    Yup.object({
      day: Yup.string().oneOf(DAYS).required('Day is required'),
      open: Yup.string()
        .matches(
          /^([0-1]\d|2[0-3]):([0-5]\d)$/,
          'Open time must be in HH:mm format',
        )
        .required('Open time is required'),
      close: Yup.string()
        .matches(
          /^([0-1]\d|2[0-3]):([0-5]\d)$/,
          'Close time must be in HH:mm format',
        )
        .required('Close time is required'),
    }),
  )
  .required();

export const PharmacyProfileDto = Yup.object({
  phone_number: phoneNumber.required('Phone number is required'),
  address: Yup.object({
    street: address.street.required('Street is required'),
    city: address.city.required('City is required'),
    state: address.state.required('State is required'),
    zip_code: address.zip_code.required('ZIP code is required'),
  }).required('Delivery address is required'),
  license_number: Yup.string()
    .matches(
      /^[A-Z0-9-]+$/,
      'License number must contain only uppercase letters, numbers, and hyphens',
    )
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number must be at most 20 characters')
    .required('License number is required'),
  open_hours: openHours,
  pharmacy_name: Yup.string()
    .min(2, 'Pharmacy name must be at least 2 characters')
    .max(100, 'Pharmacy name must be at most 100 characters')
    .required('Pharmacy name is required'),
  description: Yup.string()
    .max(200, 'Description must be at most 200 characters')
    .optional(),
  website: Yup.string().url('Website must be a valid URL').optional(),
  person_name: Yup.string()
    .min(2, 'Person name must be at least 2 characters')
    .max(100, 'Person name must be at most 100 characters')
    .optional(),
});
