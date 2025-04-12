import { NextFunction, Request, Response } from 'express';

import { token } from '@/utils/parser';
import { ErrorCodes, UnauthorizedError } from '@/utils/HttpError';
import authService from '@/auth/auth.service';
import cacheService from '@/cache/cache.service';
import { UserSession } from '@/users/user.model';

export default function (
  getTokenCacheKey: (token: string) => string = authService.getAccessTokenKey,
) {
  const tokenParser = token('Bearer');

  async function checkToken(req: Request, res: Response, next: NextFunction) {
    const tokenKey = getTokenCacheKey(req.context.pop()); // pop from token parser
    const session = await cacheService.getJSON<UserSession>(tokenKey);

    if (session != null) {
      req.context.push(session);
      return next();
    }

    next(
      new UnauthorizedError(
        'Authorization required.',
        ErrorCodes.AUTH_REQUIRED,
      ),
    );
  }

  return [tokenParser, checkToken];
}
