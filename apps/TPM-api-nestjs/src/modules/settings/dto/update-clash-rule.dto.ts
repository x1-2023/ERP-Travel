import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClashTypeEnum, ClashSeverityEnum } from './create-clash-rule.dto';

export class UpdateClashRuleDto {
  @ApiPropertyOptional({ example: 'Updated Rule Name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: ClashTypeEnum })
  @IsOptional()
  @IsEnum(ClashTypeEnum)
  clashType?: ClashTypeEnum;

  @ApiPropertyOptional({ enum: ClashSeverityEnum })
  @IsOptional()
  @IsEnum(ClashSeverityEnum)
  severity?: ClashSeverityEnum;

  @ApiPropertyOptional({ description: 'Rule configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBlocking?: boolean;
}
