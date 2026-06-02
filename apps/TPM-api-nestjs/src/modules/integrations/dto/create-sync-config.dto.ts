import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum EntitySyncTypeEnum {
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  PRICE = 'PRICE',
  PROMOTION = 'PROMOTION',
  CLAIM = 'CLAIM',
  SETTLEMENT = 'SETTLEMENT',
  GL_JOURNAL = 'GL_JOURNAL',
  DEDUCTION = 'DEDUCTION',
}

export enum SyncDirectionEnum {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
}

export enum SyncFrequencyEnum {
  REALTIME = 'REALTIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MANUAL = 'MANUAL',
}

export class CreateSyncConfigDto {
  @ApiProperty({ description: 'ERP connection ID' })
  @IsString()
  connectionId: string;

  @ApiProperty({ enum: EntitySyncTypeEnum, description: 'Entity type to sync' })
  @IsEnum(EntitySyncTypeEnum)
  entityType: EntitySyncTypeEnum;

  @ApiProperty({ enum: SyncDirectionEnum, description: 'Sync direction' })
  @IsEnum(SyncDirectionEnum)
  direction: SyncDirectionEnum;

  @ApiPropertyOptional({ enum: SyncFrequencyEnum, description: 'Sync frequency', default: 'DAILY' })
  @IsOptional()
  @IsEnum(SyncFrequencyEnum)
  frequency?: SyncFrequencyEnum;

  @ApiPropertyOptional({ description: 'Cron expression for scheduling' })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ description: 'Filter conditions (JSON)', type: 'object' })
  @IsOptional()
  filterConditions?: any;

  @ApiPropertyOptional({ description: 'Batch size for processing', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  batchSize?: number;

  @ApiPropertyOptional({ description: 'Conflict strategy', default: 'ERP_WINS' })
  @IsOptional()
  @IsString()
  conflictStrategy?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
