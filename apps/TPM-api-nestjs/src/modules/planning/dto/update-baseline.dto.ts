import { IsString, IsOptional, IsInt, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChannelEnum, PeriodTypeEnum, BaselineSourceTypeEnum } from './create-baseline.dto';

export class UpdateBaselineDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ enum: ChannelEnum })
  @IsOptional()
  @IsEnum(ChannelEnum)
  channel?: ChannelEnum;

  @ApiPropertyOptional({ example: 'Beverages' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Pepsi' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'North' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ enum: PeriodTypeEnum })
  @IsOptional()
  @IsEnum(PeriodTypeEnum)
  periodType?: PeriodTypeEnum;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodYear?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodMonth?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodWeek?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodQuarter?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Baseline volume' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baselineVolume?: number;

  @ApiPropertyOptional({ example: 250000, description: 'Baseline revenue' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baselineRevenue?: number;

  @ApiPropertyOptional({ example: 10000, description: 'Baseline units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  baselineUnits?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Baseline cases' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baselineCases?: number;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  avgPricePerUnit?: number;

  @ApiPropertyOptional({ example: 125.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  avgPricePerCase?: number;

  @ApiPropertyOptional({ enum: BaselineSourceTypeEnum })
  @IsOptional()
  @IsEnum(BaselineSourceTypeEnum)
  sourceType?: BaselineSourceTypeEnum;

  @ApiPropertyOptional({ description: 'Calculation method' })
  @IsOptional()
  @IsString()
  calculationMethod?: string;

  @ApiPropertyOptional({ description: 'Historical periods count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  historicalPeriods?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
