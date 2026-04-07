import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking, BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  async getAvailability(providerId: string, dateStr: string) {
    const provider = await this.usersService.findById(providerId);
    if (!provider?.availability) return [];

    const date = new Date(dateStr);
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });

    if (!provider.availability.days.includes(dayName)) return [];

    // Build day range
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // ONE query for all existing bookings that day — fixes the N+1 problem
    const existingBookings = await this.bookingModel.find({
      provider: new Types.ObjectId(providerId),
      status: 'confirmed',
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    const { startHour, endHour } = provider.availability;
    const freeSlots: { startTime: string; endTime: string }[] = [];

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(h, m, 0, 0);

        const slotEnd = new Date(date);
        slotEnd.setHours(h, m + 30, 0, 0);

        // Check overlap in memory — no DB call in the loop
        const overlaps = existingBookings.some(
          (b) => b.startTime < slotEnd && b.endTime > slotStart,
        );

        if (!overlaps) {
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
    const [provider, client] = await Promise.all([
      this.usersService.findById(dto.providerId),
      this.usersService.findById(clientId),
    ]);

    // Check overlap — cast providerId to ObjectId correctly
    const overlap = await this.bookingModel.findOne({
      provider: new Types.ObjectId(dto.providerId),
      status: 'confirmed',
      $or: [
        {
          startTime: { $lt: new Date(dto.endTime) },
          endTime: { $gt: new Date(dto.startTime) },
        },
      ],
    });

    if (overlap) throw new BadRequestException('This slot is already booked');

    const booking = await this.bookingModel.create({
      client: new Types.ObjectId(clientId),
      provider: new Types.ObjectId(dto.providerId),
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      status: 'confirmed',
    });

    void Promise.allSettled([
      this.mailService.sendBookingConfirmation(client.email, {
        startTime: booking.startTime,
        endTime: booking.endTime,
        otherParty: provider.name,
      }),
      this.mailService.sendBookingConfirmation(provider.email, {
        startTime: booking.startTime,
        endTime: booking.endTime,
        otherParty: client.name,
      }),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          this.logger.error(`Email ${i + 1} failed: ${r.reason}`);
        }
      });
    });

    return booking;
  }

  async getMyBookings(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const filter = { $or: [{ client: new Types.ObjectId(userId) }, { provider: new Types.ObjectId(userId) }] };

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('client provider', 'name email')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter),
    ]);

    return {
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSchedule(userId: string) {
    return this.bookingModel
      .find({
        $or: [{ client: new Types.ObjectId(userId) }, { provider: new Types.ObjectId(userId) }],
        status: { $ne: 'cancelled' },
      })
      .populate('client provider', 'name email')
      .sort({ startTime: 1 })
      .exec();
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    // Verify the requester owns this booking
    const isOwner =
      booking.client.toString() === userId ||
      booking.provider.toString() === userId;

    if (!isOwner) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    return this.bookingModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );
  }
}