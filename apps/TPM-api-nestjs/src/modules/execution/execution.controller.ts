import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import { TrackingQueryDto } from './dto/tracking-query.dto';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { SellInQueryDto } from './dto/sell-in-query.dto';
import { CreateSellInDto } from './dto/create-sell-in.dto';
import { SellOutQueryDto } from './dto/sell-out-query.dto';
import { CreateSellOutDto } from './dto/create-sell-out.dto';
import { PerformanceQueryDto } from './dto/performance-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Execution')
@ApiBearerAuth('JWT-auth')
@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SELL TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('tracking')
  @ApiOperation({
    summary: 'List sell tracking records',
    description: 'Get paginated list of sell tracking records with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Sell tracking list with pagination' })
  async findAllTracking(@Query() query: TrackingQueryDto) {
    return this.executionService.findAllTracking(query);
  }

  @Get('tracking/summary')
  @ApiOperation({
    summary: 'Get sell tracking summary',
    description: 'Get aggregated tracking summary by period',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Filter by period (e.g., "2026-01")' })
  @ApiResponse({ status: 200, description: 'Tracking summary by period' })
  async getTrackingSummary(@Query('period') period?: string) {
    return this.executionService.getTrackingSummary(period);
  }

  @Post('tracking')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or upsert sell tracking record',
    description:
      'Create or update a sell tracking record. Upserts on (customerId, productId, period).',
  })
  @ApiResponse({ status: 201, description: 'Tracking record created/updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upsertTracking(@Body() dto: CreateTrackingDto) {
    return this.executionService.upsertTracking(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELL IN
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('sell-in')
  @ApiOperation({
    summary: 'List sell-in records',
    description: 'Get paginated list of sell-in records with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Sell-in list with pagination' })
  async findAllSellIn(@Query() query: SellInQueryDto) {
    return this.executionService.findAllSellIn(query);
  }

  @Get('sell-in/summary')
  @ApiOperation({
    summary: 'Get sell-in summary',
    description: 'Get aggregated sell-in summary by period, customer, or product',
  })
  @ApiResponse({ status: 200, description: 'Sell-in summary' })
  async getSellInSummary(@Query() query: SellInQueryDto) {
    return this.executionService.getSellInSummary(query);
  }

  @Post('sell-in')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create sell-in record',
    description: 'Create a new sell-in transaction record. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Sell-in record created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSellIn(@Body() dto: CreateSellInDto, @CurrentUser('id') userId: string) {
    return this.executionService.createSellIn(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELL OUT
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('sell-out')
  @ApiOperation({
    summary: 'List sell-out records',
    description: 'Get paginated list of sell-out records with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Sell-out list with pagination' })
  async findAllSellOut(@Query() query: SellOutQueryDto) {
    return this.executionService.findAllSellOut(query);
  }

  @Get('sell-out/summary')
  @ApiOperation({
    summary: 'Get sell-out summary',
    description: 'Get aggregated sell-out summary by period',
  })
  @ApiResponse({ status: 200, description: 'Sell-out summary' })
  async getSellOutSummary(@Query() query: SellOutQueryDto) {
    return this.executionService.getSellOutSummary(query);
  }

  @Post('sell-out')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create sell-out record',
    description: 'Create a new sell-out transaction record. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Sell-out record created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSellOut(@Body() dto: CreateSellOutDto, @CurrentUser('id') userId: string) {
    return this.executionService.createSellOut(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('performance')
  @ApiOperation({
    summary: 'Get combined sell-in vs sell-out performance',
    description: 'Get combined performance metrics comparing sell-in and sell-out data',
  })
  @ApiResponse({ status: 200, description: 'Combined performance data' })
  async getPerformance(@Query() query: PerformanceQueryDto) {
    return this.executionService.getPerformance(query);
  }
}
