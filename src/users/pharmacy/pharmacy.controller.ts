import * as Yup from 'yup';

import { UserSession } from '@/users/user.model';
import userService from '@/users/user.service';
import { BadRequestError, NotFoundError } from '@/utils/HttpError';
import {
  PharmacyFilterDto,
  PharmacyIdDto,
  PharmacyProfileDto,
} from '@/users/pharmacy/pharmacy.validator';
import pharmacyService from '@/users/pharmacy/pharmacy.service';
import {
  haversineDistance,
  minutesToTimeStr,
  strTimeToMinutes,
} from '@/users/pharmacy/utils';
import {
  MedicineAIDto,
  MedicineDelDto,
  MedicineDto,
  MedicineEditDto,
  MedicineFilterDto,
  MedicineIdDto,
  MedicineItemsDto,
} from '@/users/pharmacy/medicine.validator';
import { PharmacyContext } from '@/users/pharmacy/pharmacy.model';
import { MedicineAvailability } from '@/users/pharmacy/modicine.model';
import aiService from '@/users/pharmacy/ai.service';
import { logger } from '@/utils';

class PharmacyController {
  async getProfile(this: void, session: UserSession) {
    const user = await userService.findById(session.id);

    if (user == null) throw new NotFoundError('User could not be found.');

    const profile = await pharmacyService.getProfile(user._id);
    const hasCompleteProfile = profile != null;

    return {
      data: {
        id: user._id.toString(),
        full_name: user.fullName,
        email: user.email,
        user_type: user.userType,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        has_complete_profile: hasCompleteProfile,
        profile: hasCompleteProfile
          ? {
              created_at: profile.createdAt,
              updated_at: profile.updatedAt,
              description: profile?.description,
              license_number: profile?.licenseNumber,
              open_hours: profile.openHours.map(({ day, open, close }) => ({
                day,
                open: minutesToTimeStr(open),
                close: minutesToTimeStr(close),
              })),
              person_name: profile?.personName,
              pharmacy_name: profile.pharmacyName,
              website: profile?.website,
              address: {
                street: profile?.address?.street,
                city: profile?.address?.city,
                state: profile?.address?.state,
                zip_code: profile?.address?.zipCode,
              },
              location: {
                lat: profile?.location?.coordinates[1],
                lng: profile?.location?.coordinates[0],
              },
              delivery: profile?.delivery,
              phone_number: profile.phoneNumber,
              pharmacy_logo: profile.pharmacyLogo,
            }
          : null,
      },
    };
  }

  async getProfileStatus(this: void, session: UserSession) {
    const profile = await pharmacyService.getProfile(session.id);
    const hasCompleteProfile = profile != null;

    return {
      data: {
        has_complete_profile: hasCompleteProfile,
        verified: profile?.verified === true,
        rejection: profile?.rejectionMessage ?? null,
      },
    };
  }

  async setProfile(
    this: void,
    session: UserSession,
    data: Yup.InferType<typeof PharmacyProfileDto>,
  ) {
    let pharmacyLogo: string | undefined = undefined;

    if (data.image) {
      const fileName = await userService.uploadImage(session.id, data.image);
      if (!fileName) throw new BadRequestError('Failed to upload image.');

      pharmacyLogo = fileName;
    }

    await pharmacyService.setProfile(session.id, {
      description: data?.description,
      licenseNumber: data.license_number,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      openHours: data.open_hours.map(({ day, open, close }) => ({
        day,
        open: strTimeToMinutes(open),
        close: strTimeToMinutes(close),
      })),
      personName: data?.person_name,
      pharmacyName: data.pharmacy_name,
      website: data?.website,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zip_code,
      },
      location: {
        type: 'Point',
        coordinates: [data.location.lng, data.location.lat],
      },
      delivery: data.delivery,
      phoneNumber: data.phone_number,
      pharmacyLogo,
    });
  }

  async find(
    this: void,
    session: UserSession,
    filter: Yup.InferType<typeof PharmacyFilterDto>,
  ) {
    const pharmacies =
      (await pharmacyService.find({
        name: filter.name,
        address: filter.address,
        location: filter.location,
        openHour: filter.open_hour,
        delivery: filter.delivery,
        rating: filter.rating,
        next: filter.next,
      })) ?? [];

    return {
      data: pharmacies.map((p) => {
        const openHour = p.openHours[pharmacyService.getOpenHour(p.openHours)];

        return {
          id: p._id.toString(),
          pharmacy_name: p.pharmacyName,
          pharmacy_logo: p.pharmacyLogo ?? null,
          isOpen: openHour != null,
          closes: openHour != null ? minutesToTimeStr(openHour.close) : null,
          delivery: p.delivery,
          rating: p.rating,
          address: p.address,
          distance:
            filter.location && p.location
              ? haversineDistance(
                  filter.location?.lat,
                  filter.location?.lng,
                  p.location.coordinates[1],
                  p.location.coordinates[0],
                )
              : null,
        };
      }),
    };
  }

  async getPharmacy(
    this: void,
    session: UserSession,
    pharma: Yup.InferType<typeof PharmacyIdDto>,
  ) {
    const pharmacy = await pharmacyService.getPharmacy(pharma.pharmacy_id);

    if (pharmacy == null) throw new NotFoundError('Pharmacy not found.');

    const openHour =
      pharmacy.openHours[pharmacyService.getOpenHour(pharmacy.openHours)];

    return {
      data: {
        id: pharmacy._id.toString(),
        pharmacy_name: pharmacy.pharmacyName,
        description: pharmacy.description ?? null,
        pharmacy_logo: pharmacy.pharmacyLogo ?? null,
        isOpen: openHour != null,
        closes: openHour != null ? minutesToTimeStr(openHour.close) : null,
        open_hours: pharmacy.openHours.map(({ day, open, close }) => ({
          day,
          open: minutesToTimeStr(open),
          close: minutesToTimeStr(close),
        })),
        delivery: pharmacy.delivery,
        rating: pharmacy.rating,
        address: pharmacy.address,
        website: pharmacy.website ?? null,
        location:
          pharmacy.location?.coordinates != null
            ? {
                lat: pharmacy.location.coordinates[1],
                lng: pharmacy.location.coordinates[0],
              }
            : null,
        phone_number: pharmacy.phoneNumber,
      },
    };
  }

  async addMedicine(
    this: void,
    _session: UserSession,
    ctx: PharmacyContext,
    medicine: Yup.InferType<typeof MedicineDto>,
  ) {
    const newMedicine = await pharmacyService.addMedicine(ctx.id, {
      name: medicine.name,
      description: medicine.description,
      dosage: medicine.dosage,
      quantity: medicine.quantity,
      price: medicine.price,
      form: medicine.form,
      batchNumber: medicine.batch_number,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      manufacturedDate: medicine.manufactured_date,
      expiryDate: medicine.expiry_date,
      prescriptionRequired: medicine.prescription_required,
      stockThreshold: medicine.stock_threshold,
      storageInstructions: medicine.storage_instructions,
    });

    if (medicine.image) {
      const image = medicine.image;

      (async () => {
        const fileName = await userService.uploadImage(
          `med-${newMedicine._id.toString()}`,
          image,
        );
        if (fileName) {
          newMedicine.image = fileName;
          await newMedicine.save();
        }
      })().catch(logger.error);
    }

    return {
      statusCode: 201,
    };
  }

  async editMedicine(
    this: void,
    _session: UserSession,
    pharmacy: PharmacyContext,
    medicine: Yup.InferType<typeof MedicineEditDto>,
  ) {
    const newMedicine = await pharmacyService.updateMedicine(
      pharmacy.id,
      medicine.id,
      {
        name: medicine.name,
        description: medicine.description,
        dosage: medicine.dosage,
        quantity: medicine.quantity,
        price: medicine.price,
        form: medicine.form,
        batchNumber: medicine.batch_number,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        manufacturedDate: medicine.manufactured_date,
        expiryDate: medicine.expiry_date,
        prescriptionRequired: medicine.prescription_required,
        stockThreshold: medicine.stock_threshold,
        storageInstructions: medicine.storage_instructions,
      },
    );

    if (newMedicine == null)
      throw new NotFoundError('Medicine cannot be found.');

    if (medicine.image) {
      const image = medicine.image;

      (async () => {
        const fileName = await userService.uploadImage(
          `med-${newMedicine._id.toString()}`,
          image,
        );
        if (fileName) {
          const oldFileName = newMedicine.image;

          newMedicine.image = fileName;
          await newMedicine.save();

          if (oldFileName && oldFileName != fileName) {
            await userService.deleteImage(oldFileName);
          }
        }
      })().catch(logger.error);
    }

    return {};
  }

  async delMedicines(
    this: void,
    _session: UserSession,
    pharmacy: PharmacyContext,
    medicine: Yup.InferType<typeof MedicineDelDto>,
  ) {
    const result = await pharmacyService.delMedicines(
      pharmacy.id,
      medicine.ids,
    );

    return {
      data: {
        deleted: result.deletedCount,
      },
    };
  }

  async getMedicines(
    this: void,
    _session: UserSession,
    pharmacy: PharmacyContext,
    items: Yup.InferType<typeof MedicineItemsDto>,
  ) {
    const medicines = await pharmacyService.getMedicines(
      pharmacy.id,
      items.count,
      items.page,
    );

    return {
      data: medicines.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        dosage: m.dosage,
        form: m.form,
        quantity: m.quantity,
        price: m.price,
        category: m.category,
        manufactured_date: m.manufacturedDate,
        expiry_date: m.expiryDate,
        prescription_required: m.prescriptionRequired,
        stock_threshold: m.stockThreshold,
        image: m.image,
      })),
    };
  }

  async getMedicine(
    this: void,
    _session: UserSession,
    med: Yup.InferType<typeof MedicineIdDto>,
  ) {
    const medicine = await pharmacyService.getMedicine(med.medicine_id);

    if (medicine == null) throw new NotFoundError('Medicine not found.');

    return {
      data: {
        id: medicine._id.toString(),
        pharmacy_id: medicine.pharmacy.toString(),
        name: medicine.name,
        description: medicine.description ?? null,
        dosage: medicine.dosage,
        form: medicine.form,
        quantity: medicine.quantity,
        price: medicine.price,
        category: medicine.category,
        batch_number: medicine.batchNumber ?? null,
        manufactured_date: medicine.manufacturedDate,
        expiry_date: medicine.expiryDate,
        prescription_required: medicine.prescriptionRequired,
        availability: (medicine.quantity == 0
          ? 'out_of_stock'
          : medicine.quantity <= medicine.stockThreshold
            ? 'low_stock'
            : 'in_stock') as MedicineAvailability,
        storage_instructions: medicine.storageInstructions ?? null,
        image: medicine.image,
      },
    };
  }

  async searchMedicine(
    this: void,
    session: UserSession,
    filter: Yup.InferType<typeof MedicineFilterDto>,
  ) {
    const medicines =
      (await pharmacyService.searchMedicine({
        pharmacyId: filter.pharmacy_id,
        name: filter.name,
        dosage: filter.dosage,
        form: filter.form,
        prescriptionRequired: filter.prescription_required,
        availability: filter.availability,
        category: filter.category,
        manufacturer: filter.manufacturer,
        priceRange: filter.price_range,
        next: filter.next,
      })) ?? [];

    return {
      data: medicines.map((m) => ({
        id: m._id.toString(),
        pharmacy_id: m.pharmacy.toString(),
        name: m.name,
        dosage: m.dosage,
        form: m.form,
        prescription_required: m.prescriptionRequired,
        availability: (m.quantity == 0
          ? 'out_of_stock'
          : m.quantity <= m.stockThreshold
            ? 'low_stock'
            : 'in_stock') as MedicineAvailability,
        category: m.category,
        manufacturer: m.manufacturer,
        price: m.price,
        quantity: m.quantity,
        image: m.image,
      })),
    };
  }

  async getMedicineAI(
    this: void,
    session: UserSession,
    medicine: Yup.InferType<typeof MedicineAIDto>,
  ) {
    return {
      data: await aiService.getMedicines(medicine.description),
    };
  }
}

export default new PharmacyController();
