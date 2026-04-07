import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Weekday names when the provider is available',
    example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  days!: string[];

  @ApiProperty({
    description: 'Start hour in 24h format (0–23)',
    example: 9,
    minimum: 0,
    maximum: 23,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(23)
  startHour!: number;

  @ApiProperty({
    description: 'End hour in 24h format (1–24), must be greater than startHour',
    example: 17,
    minimum: 1,
    maximum: 24,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(24)
  endHour!: number;
}