import * as Yup from 'yup';

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3); // max size for undecoded base46

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
