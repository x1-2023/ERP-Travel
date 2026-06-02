import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum GLJournalStatusFilter {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  VOIDED = 'VOIDED',
}

export enum GLJournalSourceFilter {
  ACCRUAL = 'ACCRUAL',
  SETTLEMENT = 'SETTLEMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL',
  IMPORT = 'IMPORT',
}

export class JournalQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: GLJournalStatusFilter })
  @IsOptional()
  @IsEnum(GLJournalStatusFilter)
  status?: GLJournalStatusFilter;

  @ApiPropertyOptional({ enum: GLJournalSourceFilter })
  @IsOptional()
  @IsEnum(GLJournalSourceFilter)
  source?: GLJournalSourceFilter;

  @ApiPropertyOptional({ description: 'Filter by fiscal period ID' })
  @IsOptional()
  @IsString()
  fiscalPeriodId?: string;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;
}
