import express from 'express';
import morgan from 'morgan';

import { getEnv } from '@/config';
import { errorHandler, logger, response } from '@/utils';

export function initApp() {
  const app = express();
  const port = getEnv('PORT');

  // request logger
  app.use(morgan('dev'));

  // body parsers
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // helper functions
  app.use(response);

  // middlewares
  app.get('/', (_req, res) => {
    res.success();
  });

  app.get('/error', (_req, _res, next) => {
    next(new Error());
  });

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
