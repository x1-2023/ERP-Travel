import { IsString, IsOptional, IsEnum, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditActionEnum } from './audit-query.dto';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Company ID', example: 'cuid_company_id' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'User ID who performed the action', example: 'cuid_user_id' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: AuditActionEnum, description: 'Audit action type' })
  @IsEnum(AuditActionEnum)
  action: AuditActionEnum;

  @ApiProperty({ description: 'Type of entity affected', example: 'Promotion' })
  @IsString()
  @MaxLength(100)
  entityType: string;

  @ApiPropertyOptional({ description: 'ID of the entity affected', example: 'cuid_entity_id' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Human-readable description of the action',
    example: 'Created promotion PROMO-2026-0001',
  })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ description: 'Previous values before change' })
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'New values after change' })
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
