import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('availability/:providerId')
  getAvailability(@Param('providerId') providerId: string, @Query('date') date: string) {
    return this.bookingsService.getAvailability(providerId, date);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, dto);
  }

  @Get('my-bookings')
  getMyBookings(@Req() req: any) {
    return this.bookingsService.getMyBookings(req.user.userId);
  }

  @Get('schedule')
  getSchedule(@Req() req: any) {
    return this.bookingsService.getSchedule(req.user.userId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }
}