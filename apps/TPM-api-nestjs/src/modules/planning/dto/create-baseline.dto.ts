import { IsString, IsOptional, IsInt, IsNumber, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PeriodTypeEnum {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum BaselineSourceTypeEnum {
  HISTORICAL = 'HISTORICAL',
  MANUAL = 'MANUAL',
  IBP_IMPORT = 'IBP_IMPORT',
  NIELSEN = 'NIELSEN',
  FORECAST = 'FORECAST',
  ADJUSTED = 'ADJUSTED',
}

export enum ChannelEnum {
  MT = 'MT',
  GT = 'GT',
  ECOMMERCE = 'ECOMMERCE',
  HORECA = 'HORECA',
  OTHER = 'OTHER',
}

export class CreateBaselineDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

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

  @ApiProperty({ enum: PeriodTypeEnum, default: PeriodTypeEnum.MONTHLY })
  @IsEnum(PeriodTypeEnum)
  periodType: PeriodTypeEnum;

  @ApiProperty({ example: 2024 })
  @Type(() => Number)
  @IsInt()
  periodYear: number;

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

  @ApiProperty({ example: 50000, description: 'Baseline volume' })
  @Type(() => Number)
  @IsNumber()
  baselineVolume: number;

  @ApiProperty({ example: 250000, description: 'Baseline revenue' })
  @Type(() => Number)
  @IsNumber()
  baselineRevenue: number;

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

  @ApiPropertyOptional({ example: 25.0, description: 'Average price per unit' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  avgPricePerUnit?: number;

  @ApiPropertyOptional({ example: 125.0, description: 'Average price per case' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  avgPricePerCase?: number;

  @ApiProperty({ enum: BaselineSourceTypeEnum, default: BaselineSourceTypeEnum.HISTORICAL })
  @IsEnum(BaselineSourceTypeEnum)
  sourceType: BaselineSourceTypeEnum;

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
