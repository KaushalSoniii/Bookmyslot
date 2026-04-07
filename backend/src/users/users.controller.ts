import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all users with pagination, search, filter, sort' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'John' })
  @ApiQuery({ name: 'role', required: false, enum: ['client', 'provider'] })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiOkResponse({ description: 'Returns paginated users list' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      availability: user.availability ?? null,
    };
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Update provider availability (providers only)' })
  @ApiBody({ type: UpdateAvailabilityDto })
  @ApiOkResponse({ description: 'Availability updated successfully' })
  updateAvailability(@Req() req: any, @Body() dto: UpdateAvailabilityDto) {
    return this.usersService.updateAvailability(req.user.userId, dto);
  }
}