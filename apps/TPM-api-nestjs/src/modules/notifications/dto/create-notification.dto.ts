import { IsString, IsOptional, IsEnum, IsObject, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationTypeEnum {
  PROMOTION_STATUS = 'PROMOTION_STATUS',
  CLAIM_UPDATE = 'CLAIM_UPDATE',
  FUND_ALERT = 'FUND_ALERT',
  APPROVAL_REQUEST = 'APPROVAL_REQUEST',
  SETTLEMENT_COMPLETE = 'SETTLEMENT_COMPLETE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  REPORT_READY = 'REPORT_READY',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
}

export enum NotificationChannelEnum {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Target user ID' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: NotificationTypeEnum, description: 'Notification type' })
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @ApiPropertyOptional({
    enum: NotificationChannelEnum,
    default: NotificationChannelEnum.IN_APP,
    description: 'Notification channel',
  })
  @IsOptional()
  @IsEnum(NotificationChannelEnum)
  channel?: NotificationChannelEnum = NotificationChannelEnum.IN_APP;

  @ApiProperty({ example: 'Promotion Approved', maxLength: 200, description: 'Notification title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Your promotion PRO-2026-0001 has been approved.',
    description: 'Notification message',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Additional data payload (JSON)', type: 'object' })
  @IsOptional()
  @IsObject()
  data?: object;

  @ApiPropertyOptional({
    example: '/promotions/abc123',
    description: 'URL for the notification action',
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Expiration date (ISO date string)',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
