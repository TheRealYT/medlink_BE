import { UserSession } from '@/users/user.model';
import userService from '@/users/user.service';
import { NotFoundError } from '@/utils/HttpError';

class UserController {
  async getProfile(session: UserSession) {
    const user = await userService.findById(session.id);

    if (user == null) throw new NotFoundError('User could not be found.');

    return {
      data: {
        id: user._id.toString(),
        full_name: user.full_name,
        email: user.email,
        userType: user.userType,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    };
  }
}

export default new UserController();
