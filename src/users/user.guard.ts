import { NextFunction, Request, Response } from 'express';

import { ErrorCodes, UnauthorizedError } from '@/utils/HttpError';
import { UserSession, UserType } from '@/users/user.model';

// must be placed after authGuard middleware
export default function (userType: UserType) {
  function checkUserType(req: Request, _res: Response, next: NextFunction) {
    const [session] = req.context;

    if (session != null && userType === (session as UserSession).userType)
      return next();

    next(
      new UnauthorizedError(
        'Authorization required.',
        ErrorCodes.AUTH_REQUIRED,
      ),
    );
  }

  return checkUserType;
}
