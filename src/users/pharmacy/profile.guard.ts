import { NextFunction, Request, Response } from 'express';

import { AccessDeniedError, NotFoundError } from '@/utils/HttpError';
import { UserSession } from '@/users/user.model';
import pharmacyService from '@/users/pharmacy/pharmacy.service';
import { PharmacyContext } from '@/users/pharmacy/pharmacy.model';

// must be placed after userGuard(Pharmacist)
export default function (mustVerify = false) {
  async function checkUserType(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    const [session] = req.context;
    const userId = (session as UserSession).id;

    const pharmacy = await pharmacyService.getProfile(userId);

    if (pharmacy == null)
      throw new NotFoundError('You have no a pharmacy profile.');

    if (mustVerify && !pharmacy.verified)
      throw new AccessDeniedError('You must verify your pharmacy.');

    const pharmacyContext: PharmacyContext = {
      id: pharmacy._id.toString(),
      verified: pharmacy.verified,
    };

    // pass to a controller
    req.context.push(pharmacyContext);

    next();
  }

  return checkUserType;
}
