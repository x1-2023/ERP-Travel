import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum PromotionStatusFilter {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class PromotionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: PromotionStatusFilter })
  @IsOptional()
  @IsEnum(PromotionStatusFilter)
  status?: PromotionStatusFilter;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter by fund ID' })
  @IsOptional()
  @IsString()
  fundId?: string;

  @ApiPropertyOptional({ description: 'Filter promotions starting after this date' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter promotions ending before this date' })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;
}
