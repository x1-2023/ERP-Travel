import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum AuditActionEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  MFA_SETUP = 'MFA_SETUP',
  MFA_VERIFY = 'MFA_VERIFY',
  SSO_LOGIN = 'SSO_LOGIN',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  MATCH = 'MATCH',
  WRITE_OFF = 'WRITE_OFF',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  CONFIG_CHANGE = 'CONFIG_CHANGE',
}

export class AuditQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AuditActionEnum, description: 'Filter by audit action' })
  @IsOptional()
  @IsEnum(AuditActionEnum)
  action?: AuditActionEnum;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter logs from this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter logs until this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
