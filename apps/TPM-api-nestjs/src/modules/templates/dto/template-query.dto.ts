import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TemplateCategoryEnum } from './create-template.dto';

export class TemplateQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TemplateCategoryEnum, description: 'Filter by template category' })
  @IsOptional()
  @IsEnum(TemplateCategoryEnum)
  category?: TemplateCategoryEnum;

  @ApiPropertyOptional({ description: 'Filter by public visibility (true/false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;
}
