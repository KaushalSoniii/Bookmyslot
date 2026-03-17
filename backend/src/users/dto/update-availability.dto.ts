import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsArray()
  days: string[];

  @IsNumber()
  @IsNotEmpty()
  startHour: number;

  @IsNumber()
  @IsNotEmpty()
  endHour: number;
}