import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['client', 'provider'] })
  role: 'client' | 'provider';

  @ApiProperty({ required: false, nullable: true })
  availability?: {
    days: string[];
    startHour: number;
    endHour: number;
  } | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}