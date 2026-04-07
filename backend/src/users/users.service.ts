import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: any) {
    return this.userModel.create(data);
  }

  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('-password');
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, role, sort = 'name:asc' } = query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) filter.role = role;

    const [field, order] = sort.split(':');
    const sortObj: Record<string, 1 | -1> = {
      [field]: order === 'desc' ? -1 : 1,
    };

    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')         // never expose password hash
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== 'provider') {
      throw new BadRequestException('Only providers can set availability');
    }

    if (dto.endHour <= dto.startHour) {
      throw new BadRequestException('End hour must be greater than start hour');
    }

    user.availability = dto;
    return user.save();
  }
}