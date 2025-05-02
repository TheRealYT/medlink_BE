import * as Yup from 'yup';
import dayjs from 'dayjs';

import {
  MedicineAvailability,
  MedicineCategories,
  MedicineForms,
} from '@/users/pharmacy/modicine.model';

export const MedicineDto = Yup.object({
  name: Yup.string().required('Medicine name is required'),
  description: Yup.string().optional(),
  dosage: Yup.string().required('Dosage/strength is required'),
  form: Yup.string().oneOf(MedicineForms).required('Form is required'),
  category: Yup.string().oneOf(MedicineCategories).optional(),
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
