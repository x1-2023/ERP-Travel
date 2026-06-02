import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum DeductionStatusFilter {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DISPUTED = 'DISPUTED',
  RESOLVED = 'RESOLVED',
  WRITTEN_OFF = 'WRITTEN_OFF',
  REJECTED = 'REJECTED',
}

export enum DeductionCategoryFilter {
  TRADE_PROMOTION = 'TRADE_PROMOTION',
  PRICING = 'PRICING',
  LOGISTICS = 'LOGISTICS',
  QUALITY = 'QUALITY',
  ADVERTISING = 'ADVERTISING',
  OTHER = 'OTHER',
}

export enum DeductionSourceFilter {
  ERP_AR = 'ERP_AR',
  BANK_LOCKBOX = 'BANK_LOCKBOX',
  EDI_812 = 'EDI_812',
  MANUAL = 'MANUAL',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
}

export class DeductionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DeductionStatusFilter, description: 'Filter by deduction status' })
  @IsOptional()
  @IsEnum(DeductionStatusFilter)
  status?: DeductionStatusFilter;

  @ApiPropertyOptional({
    enum: DeductionCategoryFilter,
    description: 'Filter by deduction category',
  })
  @IsOptional()
  @IsEnum(DeductionCategoryFilter)
  category?: DeductionCategoryFilter;

  @ApiPropertyOptional({ enum: DeductionSourceFilter, description: 'Filter by deduction source' })
  @IsOptional()
  @IsEnum(DeductionSourceFilter)
  source?: DeductionSourceFilter;

  @ApiPropertyOptional({ example: 'cust_abc123', description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter deductions from this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter deductions up to this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
