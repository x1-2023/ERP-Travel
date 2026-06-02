import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum AccrualStatusFilter {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  VOIDED = 'VOIDED',
}

export enum AccrualEntryTypeFilter {
  INITIAL_RESERVE = 'INITIAL_RESERVE',
  MONTHLY_ACCRUAL = 'MONTHLY_ACCRUAL',
  ADJUSTMENT = 'ADJUSTMENT',
  TRUE_UP = 'TRUE_UP',
  REVERSAL = 'REVERSAL',
  SETTLEMENT = 'SETTLEMENT',
}

export class AccrualQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({ enum: AccrualStatusFilter })
  @IsOptional()
  @IsEnum(AccrualStatusFilter)
  status?: AccrualStatusFilter;

  @ApiPropertyOptional({ enum: AccrualEntryTypeFilter })
  @IsOptional()
  @IsEnum(AccrualEntryTypeFilter)
  entryType?: AccrualEntryTypeFilter;

  @ApiPropertyOptional({ description: 'Filter by fiscal period ID' })
  @IsOptional()
  @IsString()
  fiscalPeriodId?: string;
}
