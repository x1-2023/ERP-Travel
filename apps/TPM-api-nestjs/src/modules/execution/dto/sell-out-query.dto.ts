import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SellOutQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;

  @ApiPropertyOptional({ description: 'Filter by period year', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodYear?: number;

  @ApiPropertyOptional({ description: 'Filter by period month', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodMonth?: number;

  @ApiPropertyOptional({ description: 'Filter from date', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
