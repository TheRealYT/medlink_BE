import { loadEnv, validateEnv, getEnv } from '@/config/env';
import { enableConsole } from '@/utils/logger';

export function loadConfig() {
  loadEnv();
  enableConsole(); // enable console output in development (NODE_ENV)
  validateEnv();
}

export { getEnv };
