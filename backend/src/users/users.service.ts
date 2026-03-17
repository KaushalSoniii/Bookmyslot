import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: any) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
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
    const sortObj = { [field]: order === 'desc' ? -1 : 1 };

    const skip = (Number(page) - 1) * Number(limit);

    return this.userModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .exec();
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const user = await this.findById(userId);
    if (user.role !== 'provider') throw new BadRequestException('Only providers can set availability');

    user.availability = dto;
    return user.save();
  }
}