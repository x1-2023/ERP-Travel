import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SOXViolationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by control ID' })
  @IsOptional()
  @IsString()
  controlId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by reviewed status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  reviewed?: boolean;

  @ApiPropertyOptional({ description: 'Filter by exception status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isExcepted?: boolean;
}
