import fs from 'node:fs/promises';
import path from 'node:path';

import { EmailMessage } from '@/email/email.types';
import { ADDRESS, COMPANY } from '@/config/constants';
import { getEnv } from '@/config';

async function loadTemplate(
  fileName: string,
  replacement: Record<string, string>,
) {
  let content = (
    await fs.readFile(path.join(__dirname, 'templates', fileName))
  ).toString('utf-8');

  for (const key in replacement) {
    content = content.replaceAll(key, replacement[key]);
  }

  return content;
}

const signupVerification = {
  from: () => `${COMPANY} noreply@${getEnv('EMAIL_DOMAIN')}`,
  subject: 'Almost Done! Verify Your Account Now',
  load: (otpCode: string, validity: string) => ({
    '#COMPANY#': COMPANY,
    '#COPYRIGHT#': `© ${new Date().getFullYear()} ${COMPANY}. All rights reserved.`,
    '#ADDRESS#': ADDRESS,
    '#OTP_CODE#': otpCode,
    '#VALIDITY#': validity,
  }),
};
// define more templates

const Templates = {
  signup_verification: signupVerification,
  // add more templates
};

class EmailTemplates {
  async useTemplate<T extends keyof typeof Templates>(
    name: T,
    ...args: Parameters<(typeof Templates)[T]['load']> // spread parameters of the selected `load` function
  ): Promise<EmailMessage> {
    const template = Templates[name];

    // call `load()` with the correct arguments
    const result = template.load(...(args as Parameters<typeof template.load>));
    const content = await loadTemplate(name + '.html', result);

    return {
      from: template.from(),
      subject: template.subject,
      content,
      isHtml: true,
    };
  }
}

export default new EmailTemplates();
