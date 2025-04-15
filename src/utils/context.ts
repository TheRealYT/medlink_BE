import { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    context: Array<any>;
  }
}

export default function (req: Request, _res: Response, next: NextFunction) {
  req.context = [];

  next();
}
