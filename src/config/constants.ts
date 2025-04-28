import path from 'node:path';
import fs from 'node:fs';

export const COMPANY = 'MedLink';
export const ADDRESS = 'Addis Ababa, Ethiopia';
export const PROFILE_DIR = path.join(__dirname, '..', 'uploads');

// make sure upload dir exists at startup
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR);
