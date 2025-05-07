import * as Yup from 'yup';
import dayjs from 'dayjs';

import {
  MedicineAvailability,
  MedicineCategories,
  MedicineForms,
} from '@/users/pharmacy/modicine.model';
import { image } from '@/users/user.validator';

export const MedicineDto = Yup.object({
  name: Yup.string().required('Medicine name is required'),
  description: Yup.string().optional(),
  dosage: Yup.string().required('Dosage/strength is required'),
  form: Yup.mixed<MedicineForms>()
    .oneOf(Object.values(MedicineForms) as MedicineForms[])
    .required('Form is required'),
  category: Yup.mixed<MedicineCategories>()
    .oneOf(Object.values(MedicineCategories) as MedicineCategories[])
    .required(),
  quantity: Yup.number()
    .positive('Quantity must be greater than zero')
    .required('Quantity is required'),
  price: Yup.number()
    .moreThan(0, 'Price must be greater than 0')
    .required('Price is required'),
  batch_number: Yup.string().optional(),
  manufactured_date: Yup.date()
    .test('is-past-date', 'Manufactured date must be in the past', (value) =>
      value ? dayjs(value).isBefore(dayjs()) : false,
    )
    .required('Manufactured date is required'),
  expiry_date: Yup.date()
    .test('is-future-date', 'Expiry date must be in the future', (value) =>
      value ? dayjs(value).isAfter(dayjs(), 'day') : false,
    )
    .required('Expiry date is required'),
  prescription_required: Yup.boolean().required(
    'Prescription toggle is required',
  ),
  manufacturer: Yup.string().optional(),
  storage_instructions: Yup.string().optional(),
  stock_threshold: Yup.number()
    .min(0, 'Stock threshold cannot be negative')
    .default(0)
    .optional(),
  image,
});

export const MedicineEditDto = MedicineDto.clone().shape({
  id: Yup.string().required('Medicine id is required'),
});

export const MedicineDelDto = Yup.object({
  ids: Yup.array()
    .of(Yup.string().required())
    .min(1, 'At least one medicine id is required')
    .required('Medicine ids is required'),
});

export const MedicineItemsDto = Yup.object({
  count: Yup.number().integer().positive().default(10).max(20).optional(),
  page: Yup.number().integer().positive().default(1).optional(),
});

export const MedicineFilterDto = Yup.object({
  pharmacy_id: Yup.string().length(24).optional(),
  name: Yup.string().optional(),
  category: Yup.string().optional(),
  form: Yup.string().optional(),
  dosage: Yup.string().optional(),
  price_range: Yup.object({
    min: Yup.number().min(0).optional(),
    max: Yup.number()
      .min(0)
      .optional()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      .when('min', (min, schema) => (min != null ? schema.min(min) : schema)),
  }).optional(),
  availability: Yup.mixed<MedicineAvailability>()
    .oneOf(['in_stock', 'low_stock', 'out_of_stock'])
    .optional(),
  prescription_required: Yup.boolean().optional(),
  manufacturer: Yup.string().optional(),
  next: Yup.number().integer().min(0).default(0).optional(),
});

export const MedicineAIDto = Yup.object({
  description: Yup.string()
    .min(15)
    .max(100)
    .required('Description is required'),
});
