// import { IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';

// export class CreateBookingDto {
//   @IsMongoId()
//   providerId: string;

//   @IsDateString()
//   @IsNotEmpty()
//   startTime: string;

//   @IsDateString()
//   @IsNotEmpty()
//   endTime: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the provider whose slot is being booked',
    example: '67f1a2b3c4d5e6f789012345',
  })
  @IsMongoId({ message: 'providerId must be a valid MongoDB ObjectId' })
  providerId: string;

  @ApiProperty({
    description: 'Start time of the desired appointment slot (ISO 8601 format)',
    example: '2026-03-23T10:00:00.000Z',
  })
  @IsDateString({}, { message: 'startTime must be a valid ISO date string' })
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the desired appointment slot (ISO 8601 format)',
    example: '2026-03-23T10:30:00.000Z',
  })
  @IsDateString({}, { message: 'endTime must be a valid ISO date string' })
  @IsNotEmpty()
  endTime: string;
}