import process from 'node:process';

import { initApp } from '@/app';
import { loadConfig } from '@/config';
import { connectRedis } from '@/config/redis';
import { connectMongoDB } from '@/config/mongo';

async function main() {
  loadConfig();

  // connect to databases
  await connectRedis();
  await connectMongoDB();

  // start the server
  await initApp();
}

// init required components
main()
  .then(() => {
    console.log('All services have started successfully!');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
