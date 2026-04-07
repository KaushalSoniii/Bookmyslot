import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  async getAvailability(providerId: string, dateStr: string) {
    const provider = await this.usersService.findById(providerId);
    if (!provider || !provider.availability) return [];

    const date = new Date(dateStr);
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });

    if (!provider.availability.days.includes(dayName)) return [];

    const startH = provider.availability.startHour;
    const endH = provider.availability.endHour;
    const freeSlots: any[] = [];

    for (let h = startH; h < endH; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(h, m, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(m + 30);

        const overlap = await this.bookingModel.findOne({
          provider: new Types.ObjectId(providerId),
          status: 'confirmed',
          $or: [
            { startTime: { $lt: slotEnd }, endTime: { $gt: slotStart } },
          ],
        });

        if (!overlap) {
          freeSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }
      }
    }
    return freeSlots;
  }

  async createBooking(clientId: string, dto: CreateBookingDto) {
    const provider = await this.usersService.findById(dto.providerId);
    const client = await this.usersService.findById(clientId);

    const overlap = await this.bookingModel.findOne({
      provider: dto.providerId,
      status: 'confirmed',
      $or: [
        {
          startTime: { $lt: new Date(dto.endTime) },
          endTime: { $gt: new Date(dto.startTime) },
        },
      ],
    });

    if (overlap) throw new BadRequestException('Slot already booked');

    const booking = await this.bookingModel.create({
      client: clientId,
      provider: dto.providerId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });

    try {
      await this.mailService.sendBookingConfirmation(
        client.email,
        {
          startTime: booking.startTime,
          endTime: booking.endTime,
          providerName: provider.name,
          clientName: client.name,
        },
      );

      await this.mailService.sendBookingConfirmation(
        provider.email,
        {
          startTime: booking.startTime,
          endTime: booking.endTime,
          providerName: provider.name,
          clientName: client.name,
        },
      );
    } catch (err) {
      console.error(
        'Email failed:',
        err instanceof Error ? err.message : String(err),
      );
    }

    return booking;
  }

  async getMyBookings(userId: string) {
    return this.bookingModel
      .find({ $or: [{ client: userId }, { provider: userId }] })
      .populate('client provider', 'name email')
      .exec();
  }

  async getSchedule(userId: string) {
    return this.bookingModel
      .find({ $or: [{ client: userId }, { provider: userId }] })
      .populate('client provider', 'name')
      .exec();
  }

  async cancelBooking(id: string) {
    return this.bookingModel.findByIdAndDelete(id);
  }
}