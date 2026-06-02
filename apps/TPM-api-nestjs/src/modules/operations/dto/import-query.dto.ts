import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ImportBatchStatusFilter {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export enum DeductionSourceFilter {
  ERP_AR = 'ERP_AR',
  BANK_LOCKBOX = 'BANK_LOCKBOX',
  EDI_812 = 'EDI_812',
  MANUAL = 'MANUAL',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

export class ImportQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: ImportBatchStatusFilter, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ImportBatchStatusFilter)
  status?: ImportBatchStatusFilter;

  @ApiPropertyOptional({ enum: DeductionSourceFilter, description: 'Filter by source' })
  @IsOptional()
  @IsEnum(DeductionSourceFilter)
  source?: DeductionSourceFilter;
}
