import path from 'node:path';

import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { PROFILE_DIR } from '@/config/constants';
import { BadRequestError } from '@/utils/HttpError';
import { UserSession } from '@/users/user.model';

const storage = multer.diskStorage({
  destination: PROFILE_DIR,

  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const [session] = req.context;
    cb(null, `${(session as UserSession).id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (_req: Request, file, cb) => {
    if (!file) {
      cb(null, true); // allow no file
      return;
    }

    const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExt.includes(ext)) {
      return cb(new BadRequestError('Only images are allowed.'));
    }

    cb(null, true);
  },
});

// puts filename to the context to make it accessible to subsequent controllers
function addToContext(req: Request, _res: Response, next: NextFunction) {
  if (req.file) req.context.push(req.file.filename);

  next();
}

// must be after authGuard
export default function () {
  return [upload.single('image'), addToContext];
}
