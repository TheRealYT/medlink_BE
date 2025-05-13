import * as Yup from 'yup';
import mongoose from 'mongoose';

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3); // max size for un-decoded base46

export const MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

export const image = Yup.string()
  .test('max-size', 'Image must be less than 2MB.', function (value) {
    if (!value) return true;

    return value.length <= MAX_BASE64_LENGTH;
  })
  .test(
    'valid-format',
    `Image must be one of ${Object.values(MIME_TYPES).join(', ')}.`,
    function (value) {
      if (!value) return true;

      // Check if the base64 string starts with a valid MIME type
      const validMimes = Object.keys(MIME_TYPES);
      return validMimes.some((mime) =>
        value.startsWith(`data:${mime};base64,`),
      );
    },
  )
  .optional();

export const phoneRegex = /^\d{3}\d{9}$/;
export const zipCodeRegex = /^[0-9]{4,10}$/;
export const stateCityRegex = /^[a-zA-Z\s\-']{2,50}$/;

export const address = {
  street: Yup.string().min(2).max(100),
  city: Yup.string().matches(stateCityRegex, 'City must be valid'),
  state: Yup.string().matches(stateCityRegex, 'State must be valid'),
  zip_code: Yup.string().matches(zipCodeRegex, 'ZIP code must be valid'),
};

export const genderRegex = /^M|F$/;

export const location = {
  lat: Yup.number().required().min(-90).max(90), // latitude range [-90, 90]
  lng: Yup.number().required().min(-180).max(180), // longitude range [-180, 180]
};

export const ObjectIdValidator = Yup.string().test(
  'is-valid-objectId',
  (val) => val == null || mongoose.isValidObjectId(val),
);
