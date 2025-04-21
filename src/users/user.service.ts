import { Types, InferSchemaType } from 'mongoose';

import { UserModel, UserSchema, UserType } from '@/users/user.model';

class UserService {
  async userExists(email: string, userType: UserType) {
    const exists = await UserModel.exists({ email, userType });
    return exists != null;
  }

  async findUser(email: string, userType: UserType) {
    return UserModel.findOne({ email, userType });
  }

  async findById(id: string) {
    return UserModel.findById(id);
  }

  // make sure the password is hashed
  async register(
    user: Omit<InferSchemaType<typeof UserSchema>, 'createdAt' | 'updatedAt'>,
  ) {
    return new UserModel(user).save();
  }
}

export default new UserService();
