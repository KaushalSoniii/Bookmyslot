import { IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';

export class AvailabilityQueryDto {
  @IsMongoId()
  providerId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}