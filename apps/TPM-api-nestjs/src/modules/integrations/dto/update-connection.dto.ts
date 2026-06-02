import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ERPTypeEnum } from './create-connection.dto';

export enum ERPConnectionStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  TESTING = 'TESTING',
}

export class UpdateConnectionDto {
  @ApiPropertyOptional({ description: 'Connection name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ERPTypeEnum, description: 'ERP type' })
  @IsOptional()
  @IsEnum(ERPTypeEnum)
  erpType?: ERPTypeEnum;

  @ApiPropertyOptional({ enum: ERPConnectionStatusEnum, description: 'Connection status' })
  @IsOptional()
  @IsEnum(ERPConnectionStatusEnum)
  status?: ERPConnectionStatusEnum;

  @ApiPropertyOptional({ description: 'Base URL' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'OAuth client ID' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'OAuth client secret' })
  @IsOptional()
  @IsString()
  clientSecret?: string;

  @ApiPropertyOptional({ description: 'SAP client number' })
  @IsOptional()
  @IsString()
  sapClient?: string;

  @ApiPropertyOptional({ description: 'SAP system ID' })
  @IsOptional()
  @IsString()
  sapSystemId?: string;

  @ApiPropertyOptional({ description: 'SAP language' })
  @IsOptional()
  @IsString()
  sapLanguage?: string;

  @ApiPropertyOptional({ description: 'Oracle organization ID' })
  @IsOptional()
  @IsString()
  oracleOrgId?: string;

  @ApiPropertyOptional({ description: 'Oracle responsibility ID' })
  @IsOptional()
  @IsString()
  oracleRespId?: string;

  @ApiPropertyOptional({ description: 'Connection timeout in ms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  timeout?: number;

  @ApiPropertyOptional({ description: 'Number of retry attempts' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  retryAttempts?: number;

  @ApiPropertyOptional({ description: 'Is default connection' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
