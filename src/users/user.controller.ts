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
        role: user.role,
        // @ts-ignore
        created_at: user.created_at,
        // @ts-ignore
        updated_at: user.updated_at,
      },
    };
  }
}

export default new UserController();
