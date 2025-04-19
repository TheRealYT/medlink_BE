import * as nodemailer from 'nodemailer';

import { EmailMessage } from '@/email/email.types';
import { getEnv } from '@/config';

class EmailService {
  async send(this: void, to: string, message: EmailMessage) {
    const transporter = nodemailer.createTransport({
      host: getEnv('SMTP_HOST'),
      port: getEnv('SMTP_PORT'),
      secure: getEnv('SMTP_SECURE'),
      auth: {
        user: getEnv('SMTP_USER'),
        pass: getEnv('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: message.from,
      to,
      subject: message.subject,
      text: !message.isHtml ? message.content : undefined,
      html: message.isHtml ? message.content : undefined,
    });
  }
}

export default new EmailService();
