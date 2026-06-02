import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum POAStatusFilter {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class PoaQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: POAStatusFilter, description: 'Filter by POA status' })
  @IsOptional()
  @IsEnum(POAStatusFilter)
  status?: POAStatusFilter;

  @ApiPropertyOptional({ example: 'promo_abc123', description: 'Filter by promotion ID' })
  @IsOptional()
  @IsString()
  promotionId?: string;
}
