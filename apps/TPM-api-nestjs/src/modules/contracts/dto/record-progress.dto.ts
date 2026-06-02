import { IsString, IsOptional, IsNumber, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecordProgressDto {
  @ApiProperty({ example: 3, description: 'Month number (1-12)', minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2024, description: 'Year', minimum: 2020 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  year: number;

  @ApiProperty({ example: 8500, description: 'Volume achieved this month', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume: number;

  @ApiPropertyOptional({ example: 42500, description: 'Revenue achieved this month' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  revenue?: number;

  @ApiPropertyOptional({ example: 8333.33, description: 'Target volume for this month' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target?: number;

  @ApiPropertyOptional({
    example: 'Strong performance in modern trade',
    description: 'Notes',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
