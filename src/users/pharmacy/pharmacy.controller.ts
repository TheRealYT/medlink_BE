import * as Yup from 'yup';

import { UserSession } from '@/users/user.model';
import userService from '@/users/user.service';
import { BadRequestError, NotFoundError } from '@/utils/HttpError';
import { PharmacyProfileDto } from '@/users/pharmacy/pharmacy.validator';
import pharmacyService from '@/users/pharmacy/pharmacy.service';

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
              open_hours: profile.openHours,
              person_name: profile?.personName,
              pharmacy_name: profile.pharmacyName,
              website: profile?.website,
              address: {
                street: profile?.address?.street,
                city: profile?.address?.city,
                state: profile?.address?.state,
                zip_code: profile?.address?.zipCode,
              },
              phone_number: profile.phoneNumber,
              pharmacy_logo: profile.pharmacyLogo,
              verified: profile?.verified === true,
              rejection: profile?.rejectionMessage ?? null,
            }
          : null,
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
      const fileName = session.id;

      const success = await userService.uploadProfile(fileName, data.image);
      if (!success) throw new BadRequestError('Failed to upload image.');

      pharmacyLogo = fileName;
    }

    await pharmacyService.setProfile(session.id, {
      description: data?.description,
      licenseNumber: data.license_number,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      openHours: data.open_hours,
      personName: data?.person_name,
      pharmacyName: data.pharmacy_name,
      website: data?.website,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zip_code,
      },
      phoneNumber: data.phone_number,
      pharmacyLogo,
    });
  }
}

export default new PharmacyController();
