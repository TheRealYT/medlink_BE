import crypto from 'node:crypto';
import { promisify } from 'node:util';

import bcrypt from 'bcryptjs';

export const DEFAULT_KEY_LENGTH: number = 32;
const randomBytesAsync = promisify(crypto.randomBytes);
const randomIntAsync = promisify(crypto.randomInt);

class CryptoService {
  async hash(password: string, saltOrRounds: string | number = 10) {
    return await bcrypt.hash(password, saltOrRounds);
  }

  async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async generateSessionId(length: number = DEFAULT_KEY_LENGTH) {
    const buffer = await randomBytesAsync(length);
    return buffer.toString('hex');
  }

  async generateOTP(length: number) {
    const values = new Array(length).fill(null).map(() => randomIntAsync(10));

    return (await Promise.all(values)).join('');
  }
}

export default new CryptoService();
