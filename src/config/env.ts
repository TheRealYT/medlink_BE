import process from 'node:process';

import dotenv from 'dotenv';
import * as Yup from 'yup';

import { logger } from '@/utils';

const envSchema = Yup.object().shape({
  MONGODB_URI: Yup.string()
    .matches(
      /^(mongodb(?:\+srv)?:\/\/)((\w+?):(\w+?)@|)?([\w.-]+)(?::(\d+))?\/([\w-]+)$/,
    )
    .required('MongoDB URI is required'),
  REDIS_HOST: Yup.string().required('Redis host is required'),
  REDIS_PORT: Yup.number()
    .positive()
    .integer()
    .required('Redis port is required'),
  PORT: Yup.number()
    .default(3000)
    .integer()
    .min(1024)
    .max(65535)
    .required('Port number must be between 1024 and 65535'),
  // define more variables here
});

type EnvVars = Yup.InferType<typeof envSchema>;

export function loadEnv() {
  dotenv.config();
}

export const validateEnv = () => {
  try {
    const values = envSchema.validateSync(process.env, {
      abortEarly: false,
    });

    // assign validated values
    Object.assign(process.env, values);

    logger.info('Environment variables loaded successfully');
  } catch (error) {
    logger.error('Environment validation error:', error);
    throw error;
  }
};

export const getEnv = <T extends keyof EnvVars>(key: T): EnvVars[T] => {
  const value = process.env[key];
  return value as EnvVars[T];
};
