import { Types, InferSchemaType } from 'mongoose';

import { CustomerModel, CustomerSchema } from '@/users/customer/customer.model';

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
}

export default new CustomerService();
