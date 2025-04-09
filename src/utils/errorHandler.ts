import { Request, Response, NextFunction } from 'express';

import logger from '@/utils/logger';

// 404 handler
const notFoundHandler = (_req: Request, res: Response) => {
  res.error(404, 'NOT_FOUND', 'Not found.');
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error('500 Internal Server Error', {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.error(500, 'INTERNAL_ERROR', 'Internal server error.');
};

export default [notFoundHandler, errorHandler];
