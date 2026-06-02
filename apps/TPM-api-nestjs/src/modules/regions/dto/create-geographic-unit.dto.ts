import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum GeographicLevelEnum {
  COUNTRY = 'COUNTRY',
  REGION = 'REGION',
  PROVINCE = 'PROVINCE',
  DISTRICT = 'DISTRICT',
  DEALER = 'DEALER',
}

export class CreateGeographicUnitDto {
  @ApiProperty({
    example: 'VN-HCM',
    maxLength: 50,
    description: 'Unique code for the geographic unit',
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    maxLength: 200,
    description: 'Name of the geographic unit',
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Ho Chi Minh City', description: 'English name' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({
    enum: GeographicLevelEnum,
    example: GeographicLevelEnum.PROVINCE,
    description: 'Geographic hierarchy level',
  })
  @IsEnum(GeographicLevelEnum)
  level: GeographicLevelEnum;

  @ApiPropertyOptional({ example: 'clxyz1234567890', description: 'Parent geographic unit ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 10.8231, description: 'Latitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 106.6297, description: 'Longitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true, default: true, description: 'Whether the unit is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Sort order for display' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
