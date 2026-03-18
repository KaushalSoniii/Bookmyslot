import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { formatDate } from 'date-fns';


@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendBookingConfirmation(to: string, details: any, recipientType: 'client' | 'provider') {
  const isClient = recipientType === 'client';
  const otherParty = isClient ? details.providerName : details.clientName;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${isClient ? 'Your appointment is confirmed!' : 'You have a new booking!'}</h2>
      <p>Hello ${isClient ? 'there' : details.providerName.split(' ')[0]},</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(details.startTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Time:</strong> ${formatTime(details.startTime)} – ${formatTime(details.endTime)}</p>
        <p><strong>With:</strong> ${otherParty}</p>
        ${isClient ? `<p><strong>Location/Mode:</strong> Online / In-person (as agreed)</p>` : ''}
      </div>

      <p>${isClient 
        ? 'Please make sure to be on time. You can manage or cancel this booking in your dashboard.' 
        : 'The client has booked this slot. Please prepare accordingly.'}</p>

      <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px;">
        This is an automated message from BookMySlot.
      </p>
    </div>
  `;

  await this.transporter.sendMail({
    from: this.config.get<string>('MAIL_FROM'),
    to,
    subject: isClient 
      ? `Your Booking Confirmed - ${formatDate(details.startTime, 'MMM dd, yyyy')}` 
      : `New Booking from ${details.clientName} - ${formatDate(details.startTime, 'MMM dd, yyyy')}`,
    html,
  });
}
}

function formatTime(date: any): string {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
