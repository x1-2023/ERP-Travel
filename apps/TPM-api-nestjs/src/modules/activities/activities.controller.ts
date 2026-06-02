import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { RecordSpendingDto } from './dto/record-spending.dto';
import { UpdateRoiDto } from './dto/update-roi.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ACTIVITIES
  // GET /api/activities
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all activities',
    description: 'Get paginated list of fund activities with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Activity list with pagination' })
  async findAll(@Query() query: ActivityQueryDto) {
    return this.activitiesService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY SUMMARY (aggregated stats)
  // GET /api/activities/summary
  // MUST be before :id route
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get activity summary',
    description: 'Aggregate totalAllocated, spent, remaining by activityType and status',
  })
  @ApiResponse({ status: 200, description: 'Activity summary statistics' })
  async getSummary(@Query('budgetId') budgetId?: string) {
    return this.activitiesService.getSummary(budgetId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY TYPES
  // GET /api/activities/types
  // MUST be before :id route
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('types')
  @ApiOperation({
    summary: 'Get activity types',
    description: 'Get list of distinct activity types currently in use',
  })
  @ApiResponse({ status: 200, description: 'List of activity types' })
  async getActivityTypes() {
    return this.activitiesService.getActivityTypes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE ACTIVITY
  // GET /api/activities/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get activity by ID',
    description: 'Get detailed fund activity information including budget details',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity details' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE ACTIVITY
  // POST /api/activities
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new activity',
    description: 'Create a new fund activity. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createActivityDto: CreateActivityDto, @CurrentUser('id') userId: string) {
    return this.activitiesService.create(createActivityDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ACTIVITY
  // PUT /api/activities/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update an activity',
    description: 'Update activity details. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE ACTIVITY
  // DELETE /api/activities/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an activity',
    description: 'Delete an activity (only PLANNED activities). Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 400, description: 'Activity is not in PLANNED status' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVATE ACTIVITY
  // POST /api/activities/:id/activate
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/activate')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Activate an activity',
    description: 'Transition activity from PLANNED to ACTIVE. Must have allocatedAmount > 0.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity activated successfully' })
  @ApiResponse({ status: 400, description: 'Activity cannot be activated' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async activate(@Param('id') id: string) {
    return this.activitiesService.activate(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE ACTIVITY
  // POST /api/activities/:id/complete
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/complete')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Complete an activity',
    description:
      'Transition activity from ACTIVE to COMPLETED. Auto-calculates ROI if data available.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity completed successfully' })
  @ApiResponse({ status: 400, description: 'Activity cannot be completed' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async complete(@Param('id') id: string) {
    return this.activitiesService.complete(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD SPENDING
  // POST /api/activities/:id/spend
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/spend')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Record spending on an activity',
    description: 'Record spending on an ACTIVE activity. Cannot exceed allocated amount.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Spending recorded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Spending exceeds allocated amount or activity not active',
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async recordSpending(@Param('id') id: string, @Body() recordSpendingDto: RecordSpendingDto) {
    return this.activitiesService.recordSpending(id, recordSpendingDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ROI METRICS
  // PATCH /api/activities/:id/roi
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch(':id/roi')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update ROI metrics',
    description: 'Update revenue generated and units impacted. Auto-calculates ROI.',
  })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'ROI metrics updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async updateROI(@Param('id') id: string, @Body() updateRoiDto: UpdateRoiDto) {
    return this.activitiesService.updateROI(id, updateRoiDto);
  }
}
