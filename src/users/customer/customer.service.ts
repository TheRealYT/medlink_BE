import { Types, InferSchemaType } from 'mongoose';

import { CustomerModel, CustomerSchema } from '@/users/customer/customer.model';
import pharmacyService from '@/users/pharmacy/pharmacy.service';
import { Pagination } from '@/users/user.model';

class CustomerService {
  async getProfile(
    userId: string | Types.ObjectId,
  ): Promise<InferSchemaType<typeof CustomerSchema> | null> {
    return CustomerModel.findOne({ user: userId });
  }

  async setProfile(
    userId: string | Types.ObjectId,
    profile: Omit<
      InferSchemaType<typeof CustomerSchema>,
      'user' | 'createdAt' | 'updatedAt'
    >,
  ) {
    return CustomerModel.updateOne(
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

  async getMedicineRecommendations(
    userId: string | Types.ObjectId,
    page: Pagination,
  ) {
    const user = await this.getProfile(userId);
    if (user) {
      return await pharmacyService.getMedicineRecommendations(
        user.healthDetails,
        page,
      );
    }

    return [];
  }
}

export default new CustomerService();
