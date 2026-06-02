import { IsEnum, IsOptional, IsBoolean, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTypeEnum, NotificationChannelEnum } from './create-notification.dto';

export class UpdatePreferencesDto {
  @ApiProperty({ enum: NotificationTypeEnum, description: 'Notification type to configure' })
  @IsEnum(NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @ApiPropertyOptional({
    enum: NotificationChannelEnum,
    isArray: true,
    description: 'Channels to receive this notification type on',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannelEnum, { each: true })
  channels?: NotificationChannelEnum[];

  @ApiPropertyOptional({ description: 'Whether this notification type is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ example: '22:00', description: 'Quiet hours start time (HH:mm)' })
  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @ApiPropertyOptional({ example: '08:00', description: 'Quiet hours end time (HH:mm)' })
  @IsOptional()
  @IsString()
  quietHoursEnd?: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
