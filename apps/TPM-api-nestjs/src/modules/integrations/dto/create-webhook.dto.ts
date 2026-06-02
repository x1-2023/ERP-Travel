import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsBoolean,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WebhookEventTypeEnum {
  PROMOTION_CREATED = 'PROMOTION_CREATED',
  PROMOTION_UPDATED = 'PROMOTION_UPDATED',
  PROMOTION_APPROVED = 'PROMOTION_APPROVED',
  PROMOTION_REJECTED = 'PROMOTION_REJECTED',
  PROMOTION_STARTED = 'PROMOTION_STARTED',
  PROMOTION_ENDED = 'PROMOTION_ENDED',
  CLAIM_SUBMITTED = 'CLAIM_SUBMITTED',
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  CLAIM_SETTLED = 'CLAIM_SETTLED',
  DEDUCTION_CREATED = 'DEDUCTION_CREATED',
  DEDUCTION_MATCHED = 'DEDUCTION_MATCHED',
  DEDUCTION_DISPUTED = 'DEDUCTION_DISPUTED',
  DEDUCTION_RESOLVED = 'DEDUCTION_RESOLVED',
  ACCRUAL_POSTED = 'ACCRUAL_POSTED',
  JOURNAL_CREATED = 'JOURNAL_CREATED',
  JOURNAL_POSTED = 'JOURNAL_POSTED',
  SYNC_COMPLETED = 'SYNC_COMPLETED',
  SYNC_FAILED = 'SYNC_FAILED',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
}

export class CreateWebhookDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Webhook name', example: 'Promotion Events' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Webhook URL', example: 'https://hooks.example.com/webhook' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Webhook secret for signature verification' })
  @IsString()
  secret: string;

  @ApiProperty({
    enum: WebhookEventTypeEnum,
    isArray: true,
    description: 'Events to subscribe to',
    example: ['PROMOTION_CREATED', 'PROMOTION_APPROVED'],
  })
  @IsArray()
  @IsEnum(WebhookEventTypeEnum, { each: true })
  events: WebhookEventTypeEnum[];

  @ApiPropertyOptional({ description: 'Custom HTTP headers (JSON)', type: 'object' })
  @IsOptional()
  customHeaders?: any;

  @ApiPropertyOptional({ description: 'Max retry attempts', default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Retry delay in ms', default: 60000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  retryDelayMs?: number;

  @ApiPropertyOptional({ description: 'Auto-disable after N consecutive failures', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  autoDisableAfter?: number;
}
