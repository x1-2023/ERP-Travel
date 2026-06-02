import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AccrualEntryTypeEnum {
  INITIAL_RESERVE = 'INITIAL_RESERVE',
  MONTHLY_ACCRUAL = 'MONTHLY_ACCRUAL',
  ADJUSTMENT = 'ADJUSTMENT',
  TRUE_UP = 'TRUE_UP',
  REVERSAL = 'REVERSAL',
  SETTLEMENT = 'SETTLEMENT',
}

export enum AccrualCalculationMethodEnum {
  TIME_BASED = 'TIME_BASED',
  EXECUTION_BASED = 'EXECUTION_BASED',
  CLAIM_BASED = 'CLAIM_BASED',
  MANUAL = 'MANUAL',
}

export class CreateAccrualDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Promotion ID' })
  @IsString()
  promotionId: string;

  @ApiPropertyOptional({ description: 'Tactic ID' })
  @IsOptional()
  @IsString()
  tacticId?: string;

  @ApiProperty({ description: 'Fiscal Period ID' })
  @IsString()
  fiscalPeriodId: string;

  @ApiProperty({ enum: AccrualEntryTypeEnum })
  @IsEnum(AccrualEntryTypeEnum)
  entryType: AccrualEntryTypeEnum;

  @ApiProperty({ description: 'Entry date', example: '2024-01-15' })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ example: 50000, description: 'Accrual amount' })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 150000, description: 'Cumulative accrual amount' })
  @Type(() => Number)
  @IsNumber()
  cumulativeAmount: number;

  @ApiPropertyOptional({
    enum: AccrualCalculationMethodEnum,
    default: AccrualCalculationMethodEnum.TIME_BASED,
  })
  @IsOptional()
  @IsEnum(AccrualCalculationMethodEnum)
  calculationMethod?: AccrualCalculationMethodEnum;

  @ApiPropertyOptional({ description: 'Calculation basis details' })
  @IsOptional()
  @IsObject()
  calculationBasis?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
