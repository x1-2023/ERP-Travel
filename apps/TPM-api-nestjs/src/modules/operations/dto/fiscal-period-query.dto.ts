import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum FiscalPeriodStatusFilter {
  OPEN = 'OPEN',
  SOFT_CLOSE = 'SOFT_CLOSE',
  HARD_CLOSE = 'HARD_CLOSE',
}

export class FiscalPeriodQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: FiscalPeriodStatusFilter, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(FiscalPeriodStatusFilter)
  status?: FiscalPeriodStatusFilter;

  @ApiPropertyOptional({ description: 'Filter by year', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Filter by quarter', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quarter?: number;
}
