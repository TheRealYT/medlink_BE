import fs from 'node:fs/promises';

import { InferSchemaType } from 'mongoose';

import { UserModel, UserSchema, UserType } from '@/users/user.model';
import cryptoService from '@/crypto/crypto.service';
import path from 'node:path';
import { PROFILE_DIR } from '@/config/constants';
import { MIME_TYPES } from '@/users/user.validator';
import { logger } from '@/utils';

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

  async setPassword(email: string, userType: UserType, password: string) {
    return UserModel.findOneAndUpdate(
      { email, userType },
      {
        password: await cryptoService.hash(password),
      },
    );
  }

  async uploadProfile(fileName: string, dataUrl: string) {
    // `data:image/png;base64,...`

    const start = dataUrl.indexOf(':') + 1;
    const end = dataUrl.indexOf(';');

    const mime = dataUrl.slice(start, end);
    const ext = MIME_TYPES[mime];

    if (ext != null) {
      const buffer = Buffer.from(dataUrl.slice(end + 8), 'base64');
      try {
        const filePath = path.join(PROFILE_DIR, `${fileName}.${ext}`);
        await fs.writeFile(filePath, buffer);

        return true;
      } catch (err) {
        logger.error('Failed to upload file:', err);
      }
    }

    return false;
  }
}

export default new UserService();
