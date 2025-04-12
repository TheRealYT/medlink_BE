import express from 'express';
import morgan from 'morgan';

import { getEnv } from '@/config';
import { context, errorHandler, logger, response } from '@/utils';
import authRouter from '@/auth/auth.router';
import userRouter from '@/users/user.router';

export function initApp() {
  const app = express();
  const port = getEnv('PORT');

  // helper functions added first
  app.use(response);
  app.use(context);

  // request logger
  app.use(morgan('dev'));

  // body parsers
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // api endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);

  // error handler
  app.use(errorHandler);

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port);

    server.on('listening', () => {
      logger.info(`Listening on port ${port}`, { port });
      resolve();
    });

    server.on('error', (err) => {
      logger.error('Server failed to start:', err);
      reject(err);
    });
  });
}
