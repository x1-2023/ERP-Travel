import { IsString, IsOptional, IsBoolean, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SOXControlTypeEnum, SOXControlStatusEnum } from './create-sox-control.dto';

export class UpdateSOXControlDto {
  @ApiPropertyOptional({ example: 'Updated Control Name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Control description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: SOXControlTypeEnum })
  @IsOptional()
  @IsEnum(SOXControlTypeEnum)
  type?: SOXControlTypeEnum;

  @ApiPropertyOptional({ enum: SOXControlStatusEnum })
  @IsOptional()
  @IsEnum(SOXControlStatusEnum)
  status?: SOXControlStatusEnum;

  @ApiPropertyOptional({ description: 'Control configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBlocking?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  severity?: string;
}
