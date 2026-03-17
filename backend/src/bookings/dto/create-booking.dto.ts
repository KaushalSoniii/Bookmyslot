import { IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  providerId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}