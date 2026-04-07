import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface BookingDetails {
  startTime: string | Date;
  endTime: string | Date;
  otherParty: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendBookingConfirmation(to: string, details: BookingDetails ) {
    if (!details || !details.startTime || !details.endTime || !details.otherParty) {
      throw new Error('Invalid booking details provided');
    }

    const startDate = new Date(details.startTime);
    const endDate = new Date(details.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format in booking details');
    }

    const html = `
      <h2>✅ Booking Confirmed - BookMySlot</h2>
      <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}</p>
      <p><strong>With:</strong> ${details.otherParty}</p>
      <p>Thank you! for using our services.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to,
        subject: `Booking Confirmed - ${startDate.toLocaleDateString()}`,
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}