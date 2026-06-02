import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { NotificationTypeEnum, NotificationChannelEnum } from './create-notification.dto';

export enum NotificationStatusEnum {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
  DISMISSED = 'DISMISSED',
}

export class NotificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: NotificationTypeEnum, description: 'Filter by notification type' })
  @IsOptional()
  @IsEnum(NotificationTypeEnum)
  type?: NotificationTypeEnum;

  @ApiPropertyOptional({
    enum: NotificationStatusEnum,
    description: 'Filter by notification status',
  })
  @IsOptional()
  @IsEnum(NotificationStatusEnum)
  status?: NotificationStatusEnum;

  @ApiPropertyOptional({
    enum: NotificationChannelEnum,
    description: 'Filter by notification channel',
  })
  @IsOptional()
  @IsEnum(NotificationChannelEnum)
  channel?: NotificationChannelEnum;
}
