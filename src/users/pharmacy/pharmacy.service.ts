import { FilterQuery, InferSchemaType, Types } from 'mongoose';

import {
  PharmacyFilter,
  PharmacyModel,
  PharmacySchema,
} from '@/users/pharmacy/pharmacy.model';
import { strTimeToMinutes } from '@/users/pharmacy/utils';
import {
  MedicineFilter,
  MedicineModel,
  MedicineSchema,
} from '@/users/pharmacy/modicine.model';
import { HealthCondition } from '@/users/customer/customer.model';

import { Pagination } from '@/users/user.model';

class PharmacyService {
  async getProfile(userId: string | Types.ObjectId) {
    return PharmacyModel.findOne({ user: userId });
  }

  async setProfile(
    userId: string | Types.ObjectId,
    profile: Omit<
      InferSchemaType<typeof PharmacySchema>,
      'user' | 'createdAt' | 'updatedAt' | 'verified' | 'rejectionMessage'
    >,
  ) {
    return PharmacyModel.updateOne(
      {
        user: userId,
      },
      profile,
      {
        upsert: true,
        ignoreUndefined: true,
      },
    );
  }

  async find(filter: PharmacyFilter) {
    const filterQuery: FilterQuery<typeof PharmacyModel> = {};

    // name filter
    if (filter.name != null) {
      filterQuery.pharmacyName = { $regex: filter.name, $options: 'i' };
    }

    // address filter
    if (filter.address != null) {
      filterQuery.$or = [
        {
          'address.street': {
            $regex: filter.address,
            $options: 'i',
          },
        },
        { 'address.city': { $regex: filter.address, $options: 'i' } },
        {
          'address.state': {
            $regex: filter.address,
            $options: 'i',
          },
        },
      ];
    }

    // location filter
    if (filter.location != null) {
      filterQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [filter.location.lng, filter.location.lat],
          },
          $maxDistance: filter.location.distance, // meters
        },
      };
    }

    // openHours filter
    if (filter.openHour != null) {
      const openHoursQuery: {
        $elemMatch: {
          day: string;
          open?: object | undefined;
          close?: object | undefined;
        };
      } = { $elemMatch: { day: filter.openHour.day } };

      if (filter.openHour.close != null) {
        openHoursQuery.$elemMatch.open = {
          $lt: strTimeToMinutes(filter.openHour.close),
        };
      }

      if (filter.openHour.open != null) {
        openHoursQuery.$elemMatch.close = {
          $gt: strTimeToMinutes(filter.openHour.open),
        };
      }

      filterQuery.openHours = openHoursQuery;
    }

    // delivery filter
    if (filter.delivery != null) {
      filterQuery.delivery = filter.delivery;
    }

    // rating filter
    if (filter.rating != null) {
      filterQuery.rating = { $gte: filter.rating };
    }

    return PharmacyModel.find(filterQuery)
      .skip(filter.next * 5)
      .limit(5);
  }

  getOpenHour(
    openHours: { open: number; close: number }[],
    time: Date = new Date(),
  ) {
    const nowMinutes = time.getHours() * 60 + time.getMinutes();

    for (let i = 0, n = openHours.length; i < n; i++) {
      const { open, close } = openHours[i];
      if (nowMinutes >= open && nowMinutes <= close) {
        return i; // found the matching interval
      }
    }

    return -1;
  }

  async getPharmacy(pharmacyId: string | Types.ObjectId) {
    return PharmacyModel.findById(pharmacyId);
  }

  async addMedicine(
    pharmacyId: string,
    medicine: Omit<
      InferSchemaType<typeof MedicineSchema>,
      'pharmacy' | 'createdAt' | 'updatedAt'
    >,
  ) {
    const newMedicine = new MedicineModel(medicine);
    newMedicine.pharmacy = new Types.ObjectId(pharmacyId);

    return await newMedicine.save();
  }

  async updateMedicine(
    pharmacyId: string,
    medicineId: string,
    medicine: Omit<
      InferSchemaType<typeof MedicineSchema>,
      'pharmacy' | 'createdAt' | 'updatedAt'
    >,
  ) {
    return MedicineModel.findOneAndUpdate(
      {
        pharmacy: pharmacyId,
        _id: medicineId,
      },
      medicine,
      { new: true },
    );
  }

  async delMedicines(pharmacyId: string, medicineIds: string[]) {
    return MedicineModel.deleteMany({
      $and: [
        { pharmacy: pharmacyId },
        {
          _id: {
            $in: medicineIds,
          },
        },
      ],
    });
  }

  async getMedicines(
    pharmacyId: string | Types.ObjectId,
    count: number,
    page: number,
  ) {
    return MedicineModel.find({ pharmacy: pharmacyId })
      .skip((page - 1) * count)
      .limit(count);
  }

  async getMedicine(medicineId: string | Types.ObjectId) {
    return MedicineModel.findById(medicineId).populate(
      'pharmacy',
      'pharmacyName',
    );
  }

  searchMedicine(filter: MedicineFilter): Promise<
    | (InferSchemaType<typeof MedicineSchema> & {
        _id: { toString: () => string };
      })[]
    | null
  > {
    const query: FilterQuery<typeof MedicineModel> = {
      ...(filter.pharmacyId && {
        pharmacy: new Types.ObjectId(filter.pharmacyId),
      }),
      ...(filter.name && { name: { $regex: filter.name, $options: 'i' } }),
      ...(filter.category && { category: filter.category }),
      ...(filter.form && { form: filter.form }),
      ...(filter.dosage && { dosage: filter.dosage }),
      ...(filter.prescriptionRequired != null && {
        prescriptionRequired: filter.prescriptionRequired,
      }),
      ...(filter.manufacturer && {
        manufacturer: { $regex: filter.manufacturer, $options: 'i' },
      }),
    };

    if (
      filter.priceRange &&
      (filter.priceRange.max != null || filter.priceRange.min != null)
    ) {
      query.price = {
        ...(filter.priceRange.min != null && { $gte: filter.priceRange.min }),
        ...(filter.priceRange.max != null && { $lte: filter.priceRange.max }),
      };
    }

    if (filter.availability) {
      if (filter.availability === 'in_stock') {
        query.quantity = { $gt: 0 };
      } else if (filter.availability === 'low_stock') {
        // low_stock requires aggregation, so handle separately
        return MedicineModel.aggregate([
          { $match: query },
          {
            $match: {
              $expr: {
                $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$stockThreshold'] },
                ],
              },
            },
          },
          { $skip: filter.next * 5 },
          { $limit: 5 },
        ]);
      } else if (filter.availability === 'out_of_stock') {
        query.quantity = { $eq: 0 };
      }
    }

    return MedicineModel.find(query)
      .skip(filter.next * 5)
      .limit(5)
      .populate('pharmacy', 'pharmacyName');
  }

  async getMedicineRecommendations(
    healthConditions: HealthCondition[] | string[],
    page: Pagination,
  ) {
    return MedicineModel.find({
      healthConditions: { $in: healthConditions },
    })
      .skip(page.count * (page.page - 1))
      .limit(page.count)
      .populate('pharmacy', 'pharmacyName');
  }
}

export default new PharmacyService();
