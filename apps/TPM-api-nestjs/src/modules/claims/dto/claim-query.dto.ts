import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ClaimStatusFilter {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  APPROVED = 'APPROVED',
  DISPUTED = 'DISPUTED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED',
}

export class ClaimQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ClaimStatusFilter, description: 'Filter by claim status' })
  @IsOptional()
  @IsEnum(ClaimStatusFilter)
  status?: ClaimStatusFilter;

  @ApiPropertyOptional({ example: 'cust_abc123', description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'promo_xyz456', description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({ description: 'Filter claims from this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter claims up to this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
