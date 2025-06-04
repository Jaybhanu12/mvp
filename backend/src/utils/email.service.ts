import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, body: string, attachments: string[]) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text: body,
      attachments: attachments.map(file => ({
        filename: file.split('/').pop(),
        path: file,
      })),
    };

    return transporter.sendMail(mailOptions);
  }
}
