// import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

// export class UpdateAvailabilityDto {
//   @IsArray()
//   days: string[];

//   @IsNumber()
//   @IsNotEmpty()
//   startHour: number;

//   @IsNumber()
//   @IsNotEmpty()
//   endHour: number;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Array of weekday names when the provider is available',
    example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: [String],
  })
  @IsArray({ message: 'days must be an array' })
  @IsString({ each: true, message: 'Each day must be a string' })
  days: string[];

  @ApiProperty({
    description: 'Starting hour (24-hour format, integer)',
    example: 9,
    minimum: 0,
    maximum: 23,
  })
  @IsNumber({}, { message: 'startHour must be a number' })
  @IsNotEmpty()
  startHour: number;

  @ApiProperty({
    description: 'Ending hour (24-hour format, integer) — must be greater than startHour',
    example: 17,
    minimum: 1,
    maximum: 24,
  })
  @IsNumber({}, { message: 'endHour must be a number' })
  @IsNotEmpty()
  endHour: number;
}