import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ERPConnectionStatusFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  TESTING = 'TESTING',
}

export enum ERPTypeFilter {
  SAP_S4HANA = 'SAP_S4HANA',
  SAP_ECC = 'SAP_ECC',
  ORACLE_EBS = 'ORACLE_EBS',
  ORACLE_CLOUD = 'ORACLE_CLOUD',
  DYNAMICS_365 = 'DYNAMICS_365',
  DYNAMICS_NAV = 'DYNAMICS_NAV',
  GENERIC_REST = 'GENERIC_REST',
  GENERIC_SOAP = 'GENERIC_SOAP',
}

export class ConnectionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: ERPConnectionStatusFilter, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ERPConnectionStatusFilter)
  status?: ERPConnectionStatusFilter;

  @ApiPropertyOptional({ enum: ERPTypeFilter, description: 'Filter by ERP type' })
  @IsOptional()
  @IsEnum(ERPTypeFilter)
  erpType?: ERPTypeFilter;
}
