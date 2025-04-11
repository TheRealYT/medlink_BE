import { Request, Response, NextFunction } from 'express';

import { ErrorCodes } from '@/utils/HttpError';

declare module 'express-serve-static-core' {
  interface Response {
    success: typeof success;
    error: typeof error;
  }
}

function success({
                   data,
                   message,
                   statusCode = 200,
                 }: { data?: object; message?: string; statusCode?: number } = {}) {
  return (this as Response)
    .status(statusCode)
    .setHeader('Content-Type', 'application/json')
    .json({
      ok: true,
      message,
      data,
    });
}

function error(
  statusCode: number,
  message: string,
  errorCode?: ErrorCodes,
  errorDetails?: object,
) {
  return (this as Response)
    .status(statusCode)
    .setHeader('Content-Type', 'application/json')
    .json({
      ok: false,
      error_code: errorCode,
      message,
      error: errorDetails,
    });
}

export default function(_req: Request, res: Response, next: NextFunction) {
  res.success = success;
  res.error = error;
  next();
}
