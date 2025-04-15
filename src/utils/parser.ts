import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import { AnyObject, Maybe, ObjectSchema, ValidationError } from 'yup';

import {
  BadRequestError,
  ErrorCodes,
  UnauthorizedError,
} from '@/utils/HttpError';
import { SuccessResponse } from '@/utils/response';

export enum Content {
  Body,
  Param,
  Query,
}

type Data = ParsedQs;

type Schema = Maybe<AnyObject>;

export function formatYupError(error: ValidationError): Record<string, string> {
  // change Yup validation errors to field->message object
  const errors: Record<string, string> = {};

  if (error.inner && error.inner.length > 0) {
    for (const err of error.inner) {
      if (err.path && !errors[err.path]) {
        errors[err.path] = err.message;
      }
    }
  } else if (error.path) {
    errors[error.path] = error.message;
  }

  return errors;
}

function validate<T extends Schema>(target: Content, type: ObjectSchema<T>) {
  let key: string;

  // get request content target for later lookup
  if (target == Content.Body) {
    key = 'body';
  } else if (target == Content.Param) {
    key = 'params';
  } else {
    key = 'query';
  }

  return async (req: Request, _res: Response, next: NextFunction) => {
    const rawData = req[key] as Data; // lookup
    const data: Data =
      rawData == null || typeof rawData == 'undefined' ? {} : rawData;

    try {
      const result = await type.validate(data, {
        stripUnknown: true,
        abortEarly: false,
      });

      // add the result to the request context for later routes
      req.context.push(result);
      next();
    } catch (error) {
      next(
        new BadRequestError(
          'Invalid user input supplied.',
          ErrorCodes.INVALID_INPUT,
          formatYupError(error), // return structured error
        ),
      );
    }
  };
}

// validate object from req body
export function body<T extends Schema>(type: ObjectSchema<T>) {
  return validate(Content.Body, type);
}

// validate object from req param
export function param<T extends Schema>(type: ObjectSchema<T>) {
  return validate(Content.Param, type);
}

// validate object from req query
export function query<T extends Schema>(type: ObjectSchema<T>) {
  return validate(Content.Query, type);
}

type TokenTypes = 'Bearer' | 'Api-Key' | 'Basic' | 'Custom' | 'OAuth2';

// extract token from authorization header
export function token(type?: TokenTypes) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const [specifiedType, token] = req.headers.authorization?.split(' ') ?? [];

    if (token && (!type || specifiedType === type)) {
      req.context.push(token);
      return next();
    }

    next(
      new UnauthorizedError(
        'Authorization required.',
        ErrorCodes.AUTH_REQUIRED,
      ),
    );
  };
}

// middleware wrapper that invokes a controller function with req.context as arguments.
// it automatically sends the returned value as a successful response (res.success).
// the controller must return a SuccessResponse or throw an HttpError for failure cases.
// useful for simplifying route handlers and enforcing consistent response patterns.
export function pass(
  controller: (
    ...args: any
  ) => SuccessResponse | Promise<SuccessResponse> | void | Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await controller(...req.context);
      res.success(result as SuccessResponse | undefined);
    } catch (err) {
      next(err);
    }
  };
}
