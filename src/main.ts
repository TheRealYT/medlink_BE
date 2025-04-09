import express from 'express';
import morgan from 'morgan';

import { loadConfig, getEnv } from '@/config';
import { logger, errorHandler, response } from '@/utils';

// init required components
loadConfig();

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

app.listen(port, () => {
  logger.info(`Listening on port ${port}`, { port });
});
