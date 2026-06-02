import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GeographicLevelEnum } from './create-geographic-unit.dto';

export class GeographicUnitQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: GeographicLevelEnum,
    description: 'Filter by geographic level',
  })
  @IsOptional()
  @IsEnum(GeographicLevelEnum)
  level?: GeographicLevelEnum;

  @ApiPropertyOptional({ description: 'Filter by parent geographic unit ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
