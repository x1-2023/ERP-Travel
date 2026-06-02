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
import { IntegrationsService } from './integrations.service';
import { ConnectionQueryDto } from './dto/connection-query.dto';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { CreateSyncConfigDto } from './dto/create-sync-config.dto';
import { SyncConfigQueryDto } from './dto/sync-config-query.dto';
import { SyncJobQueryDto } from './dto/sync-job-query.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookQueryDto } from './dto/webhook-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Integrations')
@ApiBearerAuth('JWT-auth')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // ERP CONNECTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('connections')
  @ApiOperation({
    summary: 'List ERP connections',
    description: 'Get paginated list of ERP connections with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Connection list with pagination' })
  async findAllConnections(@Query() query: ConnectionQueryDto) {
    return this.integrationsService.findAllConnections(query);
  }

  @Get('connections/:id')
  @ApiOperation({
    summary: 'Get ERP connection by ID',
    description: 'Get detailed connection info including sync configs and field mappings',
  })
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiResponse({ status: 200, description: 'Connection details' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async findOneConnection(@Param('id') id: string) {
    return this.integrationsService.findOneConnection(id);
  }

  @Post('connections')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create ERP connection',
    description: 'Create a new ERP connection. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Connection created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createConnection(@Body() dto: CreateConnectionDto, @CurrentUser('id') userId: string) {
    return this.integrationsService.createConnection(dto, userId);
  }

  @Put('connections/:id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update ERP connection',
    description: 'Update an existing ERP connection. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiResponse({ status: 200, description: 'Connection updated' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async updateConnection(@Param('id') id: string, @Body() dto: UpdateConnectionDto) {
    return this.integrationsService.updateConnection(id, dto);
  }

  @Post('connections/:id/test')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test ERP connection',
    description:
      'Test an ERP connection (mock ping). Updates lastPingAt and lastPingStatus. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async testConnection(@Param('id') id: string) {
    return this.integrationsService.testConnection(id);
  }

  @Delete('connections/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete ERP connection',
    description: 'Delete an INACTIVE ERP connection. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Connection ID' })
  @ApiResponse({ status: 200, description: 'Connection deleted' })
  @ApiResponse({ status: 400, description: 'Connection is not INACTIVE' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  async deleteConnection(@Param('id') id: string) {
    return this.integrationsService.deleteConnection(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC CONFIGS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('sync-configs')
  @ApiOperation({
    summary: 'List sync configurations',
    description: 'Get paginated list of sync configurations',
  })
  @ApiResponse({ status: 200, description: 'Sync config list with pagination' })
  async findAllSyncConfigs(@Query() query: SyncConfigQueryDto) {
    return this.integrationsService.findAllSyncConfigs(query);
  }

  @Post('sync-configs')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create sync configuration',
    description: 'Create a new sync configuration for an ERP connection. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Sync config created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSyncConfig(@Body() dto: CreateSyncConfigDto) {
    return this.integrationsService.createSyncConfig(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC JOBS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('sync-jobs')
  @ApiOperation({
    summary: 'List sync jobs',
    description: 'Get paginated list of sync jobs',
  })
  @ApiResponse({ status: 200, description: 'Sync job list with pagination' })
  async findAllSyncJobs(@Query() query: SyncJobQueryDto) {
    return this.integrationsService.findAllSyncJobs(query);
  }

  @Post('sync-jobs/:configId/trigger')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Trigger sync job',
    description: 'Manually trigger a sync job for a given config. Requires ADMIN role.',
  })
  @ApiParam({ name: 'configId', description: 'Sync Config ID' })
  @ApiResponse({ status: 201, description: 'Sync job triggered' })
  @ApiResponse({ status: 400, description: 'Sync config is not active' })
  @ApiResponse({ status: 404, description: 'Sync config not found' })
  async triggerSyncJob(@Param('configId') configId: string, @CurrentUser('id') userId: string) {
    return this.integrationsService.triggerSyncJob(configId, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('webhooks')
  @ApiOperation({
    summary: 'List webhook subscriptions',
    description: 'Get paginated list of webhook subscriptions',
  })
  @ApiResponse({ status: 200, description: 'Webhook list with pagination' })
  async findAllWebhooks(@Query() query: WebhookQueryDto) {
    return this.integrationsService.findAllWebhooks(query);
  }

  @Post('webhooks')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create webhook subscription',
    description: 'Create a new webhook subscription. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createWebhook(@Body() dto: CreateWebhookDto, @CurrentUser('id') userId: string) {
    return this.integrationsService.createWebhook(dto, userId);
  }

  @Put('webhooks/:id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update webhook subscription',
    description: 'Update an existing webhook subscription. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook updated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async updateWebhook(@Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.integrationsService.updateWebhook(id, dto);
  }

  @Post('webhooks/:id/toggle')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle webhook active status',
    description: 'Enable or disable a webhook subscription. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook toggled' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async toggleWebhook(@Param('id') id: string) {
    return this.integrationsService.toggleWebhook(id);
  }

  @Delete('webhooks/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete webhook subscription',
    description: 'Delete a webhook subscription. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async deleteWebhook(@Param('id') id: string) {
    return this.integrationsService.deleteWebhook(id);
  }
}
