import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TemplateCategoryEnum {
  SEASONAL = 'SEASONAL',
  DISPLAY = 'DISPLAY',
  LISTING = 'LISTING',
  REBATE = 'REBATE',
  CUSTOM = 'CUSTOM',
}

export enum ChannelEnum {
  MT = 'MT',
  GT = 'GT',
  ECOMMERCE = 'ECOMMERCE',
  HORECA = 'HORECA',
  OTHER = 'OTHER',
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'Summer Seasonal Promo', description: 'Template name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Template for summer seasonal promotions',
    description: 'Template description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Template configuration (JSON object)',
    example: { type: 'discount', rules: [] },
  })
  @IsObject()
  template: Record<string, any>;

  @ApiPropertyOptional({
    enum: TemplateCategoryEnum,
    default: TemplateCategoryEnum.CUSTOM,
    description: 'Template category',
  })
  @IsOptional()
  @IsEnum(TemplateCategoryEnum)
  category?: TemplateCategoryEnum;

  @ApiPropertyOptional({
    enum: ChannelEnum,
    isArray: true,
    description: 'Applicable sales channels',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ChannelEnum, { each: true })
  channels?: ChannelEnum[];

  @ApiPropertyOptional({ default: false, description: 'Whether the template is publicly visible' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 'cuid_company_id', description: 'Company ID for multi-tenant isolation' })
  @IsString()
  companyId: string;
}
