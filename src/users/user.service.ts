import { UserModel, UserRole } from '@/users/user.model';
import cryptoService from '@/crypto/crypto.service';

class UserService {
  async emailExists(email: string, role: UserRole) {
    const exists = await UserModel.exists({ email, role });
    return exists != null;
  }

  async findUser(email: string, role: UserRole) {
    return UserModel.findOne({ email, role });
  }

  async findById(id: string) {
    return UserModel.findById(id);
  }

  async register(user: Record<keyof typeof UserModel.schema.obj, any>) {
    user.password = await cryptoService.hash(user.password);
    return new UserModel(user).save();
  }
}

export default new UserService();
