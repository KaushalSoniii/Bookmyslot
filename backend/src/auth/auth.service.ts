import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password, role = 'client' } = dto;

    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hashed,
      role,
    });

    const payload = { sub: user._id, email: user.email, role: user.role };

    const userObj = user.toObject() as unknown as Record<string, unknown>;
    const { password: _pw, ...safeUser } = userObj;

    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };

    const userObj = user.toObject() as unknown as Record<string, unknown>;
    const { password: _pw, ...safeUser } = userObj;

    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}