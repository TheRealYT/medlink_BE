import * as Yup from 'yup';

import { DAYS } from '@/users/pharmacy/pharmacy.model';
import { address, image, location, phoneRegex } from '@/users/user.validator';
import { strTimeToMinutes } from '@/users/pharmacy/utils';

const phoneNumber = Yup.string().matches(
  phoneRegex,
  'Phone number must be valid',
);

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
  .test('no-intersecting-times', function (open_hours) {
    // map each day to its corresponding time intervals (open and close)
    const days =
      open_hours?.reduce(
        (
          acc: Record<string, { open: string; close: string }[]>,
          { day, open, close },
        ) => {
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push({ open, close });
          return acc;
        },
        {},
      ) ?? {};

    // check each day's time intervals for overlaps
    for (const day in days) {
      const times = days[day];

      // loop through all pairs of intervals for the same day
      for (let i = 0; i < times.length; i++) {
        const { open, close } = times[i];
        const openTime = strTimeToMinutes(open);
        const closeTime = strTimeToMinutes(close);

        // if close time is earlier or equal to open time, it's invalid
        if (closeTime <= openTime) {
          return this.createError({
            path: `${this.path}[${i}]`,
            message: `Invalid time interval: "${open} - ${close}" on ${day}`,
          });
        }

        // compare this interval with all subsequent intervals on the same day
        for (let j = i + 1; j < times.length; j++) {
          const { open: nextOpen, close: nextClose } = times[j];
          const nextOpenTime = strTimeToMinutes(nextOpen);
          const nextCloseTime = strTimeToMinutes(nextClose);

          // if the time intervals overlap, return an error with details
          if (
            (openTime < nextCloseTime && closeTime > nextOpenTime) || // interval i overlaps with j
            (nextOpenTime < closeTime && nextCloseTime > openTime) // interval j overlaps with i
          ) {
            return this.createError({
              message: `Overlap detected: "${open} - ${close}" and "${nextOpen} - ${nextClose}" on ${day}`,
            });
          }
        }
      }
    }

    return true;
  })
  .required();

export const PharmacyProfileDto = Yup.object({
  phone_number: phoneNumber.required('Phone number is required'),
  address: Yup.object({
    street: address.street.required('Street is required'),
    city: address.city.required('City is required'),
    state: address.state.required('State is required'),
    zip_code: address.zip_code.required('ZIP code is required'),
  }).required('Pharmacy address is required'),
  location: Yup.object({
    lat: location.lat.required('Location is required'),
    lng: location.lng.required('Location is required'),
  }).required('Location is required'),
  license_number: Yup.string()
    .matches(
      /^[A-Z0-9-]+$/,
      'License number must contain only uppercase letters, numbers, and hyphens',
    )
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number must be at most 20 characters')
    .required('License number is required'),
  open_hours: openHours,
  delivery: Yup.boolean().default(false).optional(),
  pharmacy_name: Yup.string()
    .min(3, 'Pharmacy name must be at least 3 characters')
    .max(100, 'Pharmacy name must be at most 100 characters')
    .required('Pharmacy name is required'),
  description: Yup.string()
    .max(200, 'Description must be at most 200 characters')
    .optional(),
  website: Yup.string().url('Website must be a valid URL').optional(),
  person_name: Yup.string()
    .min(3, 'Person name must be at least 3 characters')
    .max(100, 'Person name must be at most 100 characters')
    .optional(),
  image,
});
