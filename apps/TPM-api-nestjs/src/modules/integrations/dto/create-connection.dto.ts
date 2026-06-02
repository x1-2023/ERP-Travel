import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ERPTypeEnum {
  SAP_S4HANA = 'SAP_S4HANA',
  SAP_ECC = 'SAP_ECC',
  ORACLE_EBS = 'ORACLE_EBS',
  ORACLE_CLOUD = 'ORACLE_CLOUD',
  DYNAMICS_365 = 'DYNAMICS_365',
  DYNAMICS_NAV = 'DYNAMICS_NAV',
  GENERIC_REST = 'GENERIC_REST',
  GENERIC_SOAP = 'GENERIC_SOAP',
}

export class CreateConnectionDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Connection name', example: 'SAP Production' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: ERPTypeEnum, description: 'ERP type' })
  @IsEnum(ERPTypeEnum)
  erpType: ERPTypeEnum;

  @ApiProperty({ description: 'Base URL for ERP connection', example: 'https://sap.example.com' })
  @IsString()
  baseUrl: string;

  @ApiPropertyOptional({ description: 'Username for authentication' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Password for authentication' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'API key for authentication' })
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

  @ApiPropertyOptional({ description: 'SAP language', default: 'EN' })
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

  @ApiPropertyOptional({ description: 'Connection timeout in ms', default: 30000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  timeout?: number;

  @ApiPropertyOptional({ description: 'Number of retry attempts', default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  retryAttempts?: number;

  @ApiPropertyOptional({ description: 'Is default connection', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
