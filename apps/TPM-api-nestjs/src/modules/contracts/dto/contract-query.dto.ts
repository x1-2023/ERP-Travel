import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum ContractStatusFilter {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RiskLevelFilter {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  CRITICAL = 'CRITICAL',
}

export class ContractQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ContractStatusFilter, description: 'Filter by contract status' })
  @IsOptional()
  @IsEnum(ContractStatusFilter)
  status?: ContractStatusFilter;

  @ApiPropertyOptional({ example: 'cust_abc123', description: 'Filter by customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'MODERN_TRADE', description: 'Filter by channel' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ example: 'CENTRAL', description: 'Filter by region' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ enum: RiskLevelFilter, description: 'Filter by risk level' })
  @IsOptional()
  @IsEnum(RiskLevelFilter)
  riskLevel?: RiskLevelFilter;
}
