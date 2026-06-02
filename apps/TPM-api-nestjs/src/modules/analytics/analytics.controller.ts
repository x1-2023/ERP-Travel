import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview with combined metrics' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getDashboardOverview(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getDashboardOverview(yearNum);
  }

  @Get('budgets')
  @ApiOperation({ summary: 'Get budget analytics and metrics' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getBudgetAnalytics(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getBudgetMetrics(yearNum);
  }

  @Get('promotions')
  @ApiOperation({ summary: 'Get promotion analytics and metrics' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getPromotionAnalytics(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getPromotionMetrics(yearNum);
  }

  @Get('claims')
  @ApiOperation({ summary: 'Get claim analytics and metrics' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getClaimAnalytics(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getClaimMetrics(yearNum);
  }

  @Get('targets')
  @ApiOperation({ summary: 'Get target analytics and metrics' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getTargetAnalytics(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getTargetMetrics(yearNum);
  }

  @Get('trends/:entityType')
  @ApiOperation({ summary: 'Get monthly trend data for entity type' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getTrends(@Param('entityType') entityType: string, @Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getTrends(entityType, yearNum);
  }

  @Get('top-performers/:type')
  @ApiOperation({ summary: 'Get top performers by type (customers, products, regions)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopPerformers(@Param('type') type: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopPerformers(type, limitNum);
  }

  @Get('roi')
  @ApiOperation({ summary: 'Get ROI analysis based on completed promotions' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getROIAnalysis(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.analyticsService.getROIAnalysis(yearNum);
  }
}
