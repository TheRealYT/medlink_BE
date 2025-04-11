import mongoose from 'mongoose';

import { getEnv } from '@/config/env';
import { logger } from '@/utils';

export async function connectMongoDB() {
  try {
    await mongoose.connect(getEnv('MONGODB_URI'));
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    throw err;
  }
}
