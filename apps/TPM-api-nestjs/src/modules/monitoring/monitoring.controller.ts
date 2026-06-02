import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@ApiBearerAuth('JWT-auth')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get live monitoring dashboard' })
  async getLiveDashboard() {
    return this.monitoringService.getLiveDashboard();
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get active alerts (budget overruns, expiring promotions, stale claims)',
  })
  async getAlerts() {
    return this.monitoringService.getAlerts();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed from audit logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getActivityFeed(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.monitoringService.getActivityFeed(limitNum);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get counts of items pending approval' })
  async getPendingApprovals() {
    return this.monitoringService.getPendingApprovals();
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get key performance indicators for the year' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getKPIs(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.monitoringService.getKPIs(yearNum);
  }
}
