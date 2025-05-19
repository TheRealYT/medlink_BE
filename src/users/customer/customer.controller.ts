import * as Yup from 'yup';

import { UserSession } from '@/users/user.model';
import userService from '@/users/user.service';
import { BadRequestError, NotFoundError } from '@/utils/HttpError';
import {
  CustomerProfileDto,
  RecommendationsDto,
} from '@/users/customer/customer.validator';
import customerService from '@/users/customer/customer.service';
import { MedicineAvailability } from '@/users/pharmacy/modicine.model';

class CustomerController {
  async getProfile(this: void, session: UserSession) {
    const user = await userService.findById(session.id);

    if (user == null) throw new NotFoundError('User could not be found.');

    const profile = await customerService.getProfile(user._id);
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
              alternate_phone_number: profile?.alternatePhoneNumber,
              date_of_birth: profile?.dateOfBirth,
              delivery_address: {
                street: profile?.deliveryAddress?.street,
                city: profile?.deliveryAddress?.city,
                state: profile?.deliveryAddress?.state,
                zip_code: profile?.deliveryAddress?.zipCode,
              },
              emergency_contact: profile?.emergencyContact,
              health_details: profile?.healthDetails as string[],
              phone_number: profile?.phoneNumber,
              gender: profile?.gender,
              profile_picture: profile?.profilePicture,
            }
          : null,
      },
    };
  }

  async setProfile(
    this: void,
    session: UserSession,
    data: Yup.InferType<typeof CustomerProfileDto>,
  ) {
    let profilePicture: string | undefined = undefined;

    if (data.image) {
      const fileName = await userService.uploadImage(session.id, data.image);
      if (!fileName) throw new BadRequestError('Failed to upload image.');

      profilePicture = fileName;
    }

    await customerService.setProfile(session.id, {
      alternatePhoneNumber: data?.alternate_phone_number,
      dateOfBirth: data?.date_of_birth,
      deliveryAddress: {
        street: data.delivery_address.street,
        city: data.delivery_address.city,
        state: data.delivery_address.state,
        zipCode: data.delivery_address.zip_code,
      },
      emergencyContact: data?.emergency_contact,
      healthDetails: data?.health_details as string[],
      phoneNumber: data.phone_number,
      gender: data.gender,
      profilePicture,
    });
  }

  async getMedicineRecommendations(
    this: void,
    session: UserSession,
    page: Yup.InferType<typeof RecommendationsDto>,
  ) {
    const medicines = await customerService.getMedicineRecommendations(
      session.id,
      page,
    );

    return {
      data: medicines.map((m) => ({
        id: m._id.toString(),
        name: m.name,
        pharmacy_id: m.pharmacy._id.toString(),
        pharmacy_name: (m.pharmacy as unknown as { pharmacyName: string })
          .pharmacyName,
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
}

export default new CustomerController();
