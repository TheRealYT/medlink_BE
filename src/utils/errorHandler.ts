import { Request, Response, NextFunction } from 'express';

import logger from '@/utils/logger';
import { ErrorCodes, HttpError, NotFoundError } from '@/utils/HttpError';

// 404 handler
const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Not found.', ErrorCodes.NOT_FOUND));
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    res.error(err.statusCode, err.message, err.errorCode, err.errorDetails);
    return;
  }

  logger.error('500 Internal Server Error', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.error(500, 'Internal server error.', ErrorCodes.INTERNAL_ERROR);
};

export default [notFoundHandler, errorHandler];
