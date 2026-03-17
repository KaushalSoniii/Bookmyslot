import { Controller, Get, Post, Patch, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get providers list with pagination, search, filter, sort' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Only provider can set availability' })
  updateAvailability(@Req() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.usersService.updateAvailability(req.user.userId, dto);
  }
}