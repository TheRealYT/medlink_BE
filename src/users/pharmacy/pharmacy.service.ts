import { Types, InferSchemaType } from 'mongoose';

import { PharmacyModel, PharmacySchema } from '@/users/pharmacy/pharmacy.model';

class PharmacyService {
  async getProfile(
    userId: string | Types.ObjectId,
  ): Promise<InferSchemaType<typeof PharmacySchema> | null> {
    return PharmacyModel.findOne({ user: userId });
  }

  async setProfile(
    userId: string | Types.ObjectId,
    profile: Omit<
      InferSchemaType<typeof PharmacySchema>,
      'user' | 'createdAt' | 'updatedAt'
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
}

export default new PharmacyService();
