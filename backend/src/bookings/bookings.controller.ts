import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get available slots for a provider on a given date' })
  @ApiQuery({ name: 'date', required: true, example: '2026-04-10' })
  @ApiOkResponse({ description: 'Returns list of available time slots' })
  getAvailability(
    @Param('providerId') providerId: string,
    @Query('date') date: string,
  ) {
    return this.bookingsService.getAvailability(providerId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Book a slot with a provider' })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({ description: 'Booking confirmed' })
  @ApiBadRequestResponse({ description: 'Slot already booked' })
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.userId, dto);
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get my bookings (client or provider)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({ description: 'Returns paginated bookings list' })
  getMyBookings(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.bookingsService.getMyBookings(
      req.user.userId,
      Number(page),
      Number(limit),
    );
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Get schedule for calendar view' })
  @ApiOkResponse({ description: 'Returns all confirmed bookings for calendar' })
  getSchedule(@Req() req: any) {
    return this.bookingsService.getSchedule(req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking (must be your own)' })
  @ApiOkResponse({ description: 'Booking cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  @ApiForbiddenResponse({ description: 'Not your booking' })
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingsService.cancelBooking(id, req.user.userId);
  }
}