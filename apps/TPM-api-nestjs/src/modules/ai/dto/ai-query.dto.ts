import { IsOptional, IsString, IsBoolean, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { INSIGHT_TYPES } from './create-insight.dto';

export class AIQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: INSIGHT_TYPES,
    description: 'Filter by insight type',
  })
  @IsOptional()
  @IsString()
  @IsIn(INSIGHT_TYPES)
  type?: string;

  @ApiPropertyOptional({
    example: 'Promotion',
    description: 'Filter by entity type',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by read status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filter by dismissed status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDismissed?: boolean;

  @ApiPropertyOptional({
    example: 0.5,
    minimum: 0,
    maximum: 1,
    description: 'Minimum confidence threshold',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidence?: number;
}
