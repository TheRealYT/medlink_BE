export enum ErrorCodes {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
}

export class HttpError extends Error {
  statusCode: number;
  errorCode?: ErrorCodes;
  errorDetails?: object;

  constructor(
    statusCode: number,
    message: string,
    errorCode?: ErrorCodes,
    errorDetails?: object,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorDetails = errorDetails;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, errorCode?: ErrorCodes, errorDetails?: object) {
    super(400, message, errorCode, errorDetails);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, errorCode?: ErrorCodes, errorDetails?: object) {
    super(404, message, errorCode, errorDetails);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, errorCode?: ErrorCodes, errorDetails?: object) {
    super(401, message, errorCode, errorDetails);
  }
}
