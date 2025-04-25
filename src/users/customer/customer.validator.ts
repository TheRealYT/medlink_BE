import * as Yup from 'yup';
import dayjs from 'dayjs';

import { HealthCondition } from '@/users/customer/customer.model';
import { image } from '@/users/user.validator';

const phoneRegex = /^[+]?[0-9]{7,15}$/;
const zipCodeRegex = /^[0-9]{4,10}$/;
const stateCityRegex = /^[a-zA-Z\s\-']{2,50}$/;

const MINIMUM_AGE = 13;

const phoneNumber = Yup.string().matches(
  phoneRegex,
  'Phone number must be valid',
);

const alternatePhoneNumber = Yup.string()
  .matches(phoneRegex, 'Alternate phone number must be valid')
  .optional();

const dateOfBirth = Yup.date()
  .test('min-age', `You must be at least ${MINIMUM_AGE} years old`, (value) => {
    if (value == null) return true;

    const age = dayjs().diff(dayjs(value), 'year');
    return age >= MINIMUM_AGE;
  })
  .optional();

const deliveryAddress = {
  street: Yup.string().min(2).max(100),
  city: Yup.string().matches(stateCityRegex, 'City must be valid'),
  state: Yup.string().matches(stateCityRegex, 'State must be valid'),
  zip_code: Yup.string().matches(zipCodeRegex, 'ZIP code must be valid'),
};

const emergencyContact = Yup.object({
  name: Yup.string().min(2).max(100).optional(),
  phone: Yup.string()
    .matches(phoneRegex, 'Emergency phone must be valid')
    .optional(),
}).optional();

const healthDetails = Yup.array()
  .of(Yup.mixed<HealthCondition>().oneOf(Object.values(HealthCondition)))
  .optional();

export const CustomerProfileDto = Yup.object({
  phone_number: phoneNumber.required('Phone number is required'),
  alternate_phone_number: alternatePhoneNumber,
  date_of_birth: dateOfBirth,

  delivery_address: Yup.object({
    street: deliveryAddress.street.required('Street is required'),
    city: deliveryAddress.city.required('City is required'),
    state: deliveryAddress.state.required('State is required'),
    zip_code: deliveryAddress.zip_code.required('ZIP code is required'),
  }).required('Delivery address is required'),

  emergency_contact: emergencyContact,

  health_details: healthDetails,

  image,
});

export const CustomerProfileUpdateDto = Yup.object({
  phone_number: phoneNumber.optional(),
  alternate_phone_number: alternatePhoneNumber,
  date_of_birth: dateOfBirth,

  delivery_address: Yup.object({
    street: deliveryAddress.street.optional(),
    city: deliveryAddress.city.optional(),
    state: deliveryAddress.state.optional(),
    zip_code: deliveryAddress.zip_code.optional(),
  }).optional(),

  emergency_contact: emergencyContact,

  health_details: healthDetails,
});
