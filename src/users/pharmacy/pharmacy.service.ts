import { FilterQuery, InferSchemaType, Types } from 'mongoose';

import {
  PharmacyFilter,
  PharmacyModel,
  PharmacySchema,
} from '@/users/pharmacy/pharmacy.model';
import { strTimeToMinutes } from '@/users/pharmacy/utils';
import { MedicineModel, MedicineSchema } from '@/users/pharmacy/modicine.model';

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

  async addMedicine(
    pharmacyId: string,
    medicine: Omit<
      InferSchemaType<typeof MedicineSchema>,
      'pharmacy' | 'createdAt' | 'updatedAt'
    >,
  ) {
    const newMedicine = new MedicineModel(medicine);
    newMedicine.pharmacy = new Types.ObjectId(pharmacyId);

    await newMedicine.save();

    return true;
  }

  async updateMedicine(
    pharmacyId: string,
    medicineId: string,
    medicine: Omit<
      InferSchemaType<typeof MedicineSchema>,
      'pharmacy' | 'createdAt' | 'updatedAt'
    >,
  ) {
    await MedicineModel.findOneAndUpdate(
      {
        pharmacy: pharmacyId,
        _id: medicineId,
      },
      medicine,
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
}

export default new PharmacyService();
