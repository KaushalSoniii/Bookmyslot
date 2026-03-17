// import { IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';

// export class AvailabilityQueryDto {
//   @IsMongoId()
//   providerId: string;

//   @IsDateString()
//   @IsNotEmpty()
//   date: string;
// };

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the provider whose availability we want to check',
    example: '67f1a2b3c4d5e6f789012345',
  })
  @IsMongoId({ message: 'providerId must be a valid MongoDB ObjectId' })
  providerId: string;

  @ApiProperty({
    description: 'Date for which to fetch available time slots (ISO 8601 date or datetime)',
    example: '2026-03-23',
    format: 'date',
  })
  @IsDateString({}, { message: 'date must be a valid ISO date string' })
  @IsNotEmpty()
  date: string;
}