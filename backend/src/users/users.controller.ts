import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

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
  @ApiOkResponse({ type: UserResponseDto })
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    availability: user.availability
  };
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Update provider availability (provider only)' })
  @ApiBody({ type: UpdateAvailabilityDto })
  @ApiOkResponse({ description: 'Availability updated' })
  updateAvailability(@Req() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.usersService.updateAvailability(req.user.userId, dto);
  }
}