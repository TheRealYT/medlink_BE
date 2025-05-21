import path from 'node:path';

import { Router } from 'express';

import { logger } from '@/utils';

const router = Router();

// android apk endpoint
router.use('/download/android', (_, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'MedLink.apk'), (err) => {
    if (!err) return;

    logger.error('APK Error: ', err);
    next();
  });
});

export default router;
