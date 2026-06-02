import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TargetMetricEnum {
  CASES = 'CASES',
  VOLUME_LITERS = 'VOLUME_LITERS',
  REVENUE_VND = 'REVENUE_VND',
  UNITS = 'UNITS',
}

export class CreateTargetDto {
  @ApiProperty({ example: 'TGT-2024-Q1-001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Q1 2024 Sales Target - Northern Region', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Sales target for Q1 2024 covering all northern provinces' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 2024, minimum: 2020, maximum: 2030 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 4,
    description: 'Quarter (1-4), null for annual',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 12,
    description: 'Month (1-12), null for quarterly/annual',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiProperty({ example: 50000, minimum: 0, description: 'Total target value' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalTarget: number;

  @ApiPropertyOptional({ enum: TargetMetricEnum, default: TargetMetricEnum.CASES })
  @IsOptional()
  @IsEnum(TargetMetricEnum)
  metric?: TargetMetricEnum;
}
