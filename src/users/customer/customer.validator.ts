import * as Yup from 'yup';
import dayjs from 'dayjs';

import { HealthCondition } from '@/users/customer/customer.model';
import {
  address,
  genderRegex,
  image,
  phoneRegex,
} from '@/users/user.validator';

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

const emergencyContact = Yup.object({
  name: Yup.string().min(2).max(100).optional(),
  phone: Yup.string()
    .matches(phoneRegex, 'Emergency phone must be valid')
    .optional(),
}).optional();

const healthDetails = Yup.array()
  .of(Yup.mixed<HealthCondition>().oneOf(Object.values(HealthCondition)))
  .test('gender-specific-condition', function (values) {
    if (values == null) return true;

    const { gender } = this.parent;

    for (let i = 0; i < values.length; i++) {
      if (gender === 'M' && values[i] === HealthCondition.PREGNANCY) {
        return this.createError({
          path: `${this.path}[${i}]`,
          message: 'This health condition is not valid for your gender',
        });
      }
    }

    return true;
  })
  .optional();

export const CustomerProfileDto = Yup.object({
  phone_number: phoneNumber.required('Phone number is required'),
  gender: Yup.string()
    .matches(genderRegex, 'Gender must be valid either M or F')
    .required('Gender is required'),
  alternate_phone_number: alternatePhoneNumber,
  date_of_birth: dateOfBirth,

  delivery_address: Yup.object({
    street: address.street.required('Street is required'),
    city: address.city.required('City is required'),
    state: address.state.required('State is required'),
    zip_code: address.zip_code.required('ZIP code is required'),
  }).required('Delivery address is required'),

  emergency_contact: emergencyContact,

  health_details: healthDetails,

  image,
});
