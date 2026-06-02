import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ChannelFilter {
  MT = 'MT',
  GT = 'GT',
  ECOMMERCE = 'ECOMMERCE',
  HORECA = 'HORECA',
  OTHER = 'OTHER',
}

export class BaselineQueryDto extends PaginationDto {
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

  @ApiPropertyOptional({ enum: ChannelFilter })
  @IsOptional()
  @IsEnum(ChannelFilter)
  channel?: ChannelFilter;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodYear?: number;
}
