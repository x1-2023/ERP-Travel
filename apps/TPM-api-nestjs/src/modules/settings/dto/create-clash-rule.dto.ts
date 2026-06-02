import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClashTypeEnum {
  TIME_OVERLAP = 'TIME_OVERLAP',
  CUSTOMER_OVERLAP = 'CUSTOMER_OVERLAP',
  PRODUCT_OVERLAP = 'PRODUCT_OVERLAP',
  CHANNEL_OVERLAP = 'CHANNEL_OVERLAP',
  DISCOUNT_STACK = 'DISCOUNT_STACK',
  EXCLUSIVITY_VIOLATION = 'EXCLUSIVITY_VIOLATION',
  MECHANIC_CONFLICT = 'MECHANIC_CONFLICT',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
}

export enum ClashSeverityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateClashRuleDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'No Duplicate MT Promos', description: 'Rule name' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: ClashTypeEnum })
  @IsEnum(ClashTypeEnum)
  clashType: ClashTypeEnum;

  @ApiPropertyOptional({ enum: ClashSeverityEnum, default: ClashSeverityEnum.MEDIUM })
  @IsOptional()
  @IsEnum(ClashSeverityEnum)
  severity?: ClashSeverityEnum;

  @ApiProperty({ description: 'Rule configuration', example: { channel: 'MT', maxOverlapDays: 7 } })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBlocking?: boolean;
}
