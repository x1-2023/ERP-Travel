import { IsOptional, IsString, IsBoolean, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FundTypeEnum } from './create-fund.dto';

export class FundQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FundTypeEnum, description: 'Filter by fund type' })
  @IsOptional()
  @IsEnum(FundTypeEnum)
  type?: FundTypeEnum;

  @ApiPropertyOptional({ example: 2026, description: 'Filter by fiscal year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
