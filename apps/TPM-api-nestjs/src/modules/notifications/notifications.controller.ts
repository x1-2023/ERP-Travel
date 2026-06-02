import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST NOTIFICATIONS
  // GET /api/notifications
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List notifications for current user',
    description:
      'Get paginated list of notifications with optional filtering by type, status, and channel',
  })
  @ApiResponse({ status: 200, description: 'Notification list with pagination' })
  async findAll(@Query() query: NotificationQueryDto, @CurrentUser('id') userId: string) {
    return this.notificationsService.findAll(query, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET UNREAD COUNT
  // GET /api/notifications/unread-count
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Returns the number of unread notifications for the current user',
  })
  @ApiResponse({ status: 200, description: 'Unread notification count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET PREFERENCES
  // GET /api/notifications/preferences
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('preferences')
  @ApiOperation({
    summary: 'Get notification preferences',
    description: 'Get all notification preferences for the current user',
  })
  @ApiResponse({ status: 200, description: 'User notification preferences' })
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE NOTIFICATION
  // GET /api/notifications/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get notification by ID',
    description: 'Get a single notification. Must belong to the current user.',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification details' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.findOne(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE NOTIFICATION
  // POST /api/notifications
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a notification',
    description: 'Send a notification to a user. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK AS READ
  // POST /api/notifications/:id/read
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a single notification as read for the current user',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK ALL AS READ
  // POST /api/notifications/read-all
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the current user',
  })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DISMISS NOTIFICATION
  // POST /api/notifications/:id/dismiss
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dismiss a notification',
    description: 'Dismiss a notification for the current user',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification dismissed' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async dismissNotification(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.dismissNotification(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIVE NOTIFICATION
  // POST /api/notifications/:id/archive
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a notification',
    description: 'Archive a notification for the current user',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification archived' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async archiveNotification(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.archiveNotification(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE PREFERENCES
  // PUT /api/notifications/preferences
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('preferences')
  @ApiOperation({
    summary: 'Update notification preferences',
    description:
      'Update or create notification preferences for the current user. Uses upsert on userId + notificationType.',
  })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Body() dto: UpdatePreferencesDto, @CurrentUser('id') userId: string) {
    return this.notificationsService.updatePreferences(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE NOTIFICATION
  // DELETE /api/notifications/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Delete a notification. Must belong to the current user.',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.delete(id, userId);
  }
}
