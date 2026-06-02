import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  IsUrl,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WebhookEventTypeEnum } from './create-webhook.dto';

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'Webhook name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Webhook URL' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Webhook secret' })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({
    enum: WebhookEventTypeEnum,
    isArray: true,
    description: 'Events to subscribe to',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WebhookEventTypeEnum, { each: true })
  events?: WebhookEventTypeEnum[];

  @ApiPropertyOptional({ description: 'Custom HTTP headers (JSON)', type: 'object' })
  @IsOptional()
  customHeaders?: any;

  @ApiPropertyOptional({ description: 'Max retry attempts' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Retry delay in ms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  retryDelayMs?: number;

  @ApiPropertyOptional({ description: 'Auto-disable after N consecutive failures' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  autoDisableAfter?: number;
}
