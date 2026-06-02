import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AccrualCalculationMethodConfigEnum {
  TIME_BASED = 'TIME_BASED',
  EXECUTION_BASED = 'EXECUTION_BASED',
  CLAIM_BASED = 'CLAIM_BASED',
  MANUAL = 'MANUAL',
}

export enum AccrualFrequencyEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class UpdateAccrualConfigDto {
  @ApiPropertyOptional({ description: 'Company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ example: '6100' })
  @IsOptional()
  @IsString()
  tradeExpenseAccount?: string;

  @ApiPropertyOptional({ example: '2100' })
  @IsOptional()
  @IsString()
  accruedLiabilityAccount?: string;

  @ApiPropertyOptional({ enum: AccrualCalculationMethodConfigEnum })
  @IsOptional()
  @IsEnum(AccrualCalculationMethodConfigEnum)
  defaultCalculationMethod?: AccrualCalculationMethodConfigEnum;

  @ApiPropertyOptional({ enum: AccrualFrequencyEnum })
  @IsOptional()
  @IsEnum(AccrualFrequencyEnum)
  accrualFrequency?: AccrualFrequencyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoCalculate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPost?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAccrualAmount?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  varianceThresholdPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowBackdatedEntries?: boolean;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gracePeriodDays?: number;
}
