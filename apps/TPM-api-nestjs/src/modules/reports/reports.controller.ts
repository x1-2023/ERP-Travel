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
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { ExecuteReportDto } from './dto/execute-report.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST REPORTS
  // GET /api/reports
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all report definitions',
    description: 'Get paginated list of report definitions with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Report definition list with pagination' })
  async findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET REPORT CATEGORIES
  // GET /api/reports/categories
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('categories')
  @ApiOperation({
    summary: 'Get distinct report categories',
    description: 'Returns all unique report categories',
  })
  @ApiResponse({ status: 200, description: 'List of report categories' })
  async getCategories() {
    return this.reportsService.getCategories();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET REPORT FORMATS
  // GET /api/reports/formats
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('formats')
  @ApiOperation({
    summary: 'Get available report formats',
    description: 'Returns all supported report output formats',
  })
  @ApiResponse({ status: 200, description: 'List of report formats' })
  async getFormats() {
    return this.reportsService.getFormats();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE REPORT
  // GET /api/reports/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get report definition by ID',
    description: 'Get detailed report definition including schedules and recent executions',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 200, description: 'Report definition details' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE REPORT
  // POST /api/reports
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new report definition',
    description:
      'Create a new report definition with data source, columns, and filters. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Report definition created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createReportDto: CreateReportDto, @CurrentUser('id') userId: string) {
    return this.reportsService.create(createReportDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE REPORT
  // PUT /api/reports/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a report definition',
    description: 'Update report definition details. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 200, description: 'Report definition updated successfully' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(id, updateReportDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE REPORT
  // DELETE /api/reports/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a report definition',
    description:
      'Delete a report definition and all related schedules and executions (cascade). Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 200, description: 'Report definition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTE REPORT
  // POST /api/reports/:id/execute
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Execute a report',
    description:
      'Trigger report generation. Creates a new execution record and simulates generation.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 201, description: 'Report execution started' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async executeReport(
    @Param('id') id: string,
    @Body() executeReportDto: ExecuteReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.executeReport(id, executeReportDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SCHEDULE
  // POST /api/reports/:id/schedule
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/schedule')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a report schedule',
    description: 'Add a schedule to an existing report definition for recurring execution.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 201, description: 'Report schedule created successfully' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async createSchedule(
    @Param('id') id: string,
    @Body() createScheduleDto: CreateScheduleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.createSchedule(id, createScheduleDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE SCHEDULE
  // DELETE /api/reports/:id/schedule/:scheduleId
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id/schedule/:scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a report schedule',
    description: 'Remove a schedule from a report definition.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiParam({ name: 'scheduleId', description: 'Report Schedule ID' })
  @ApiResponse({ status: 200, description: 'Report schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report schedule not found' })
  async deleteSchedule(@Param('id') id: string, @Param('scheduleId') scheduleId: string) {
    return this.reportsService.deleteSchedule(id, scheduleId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET EXECUTION HISTORY
  // GET /api/reports/:id/executions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id/executions')
  @ApiOperation({
    summary: 'Get report execution history',
    description: 'Get paginated execution history for a report definition.',
  })
  @ApiParam({ name: 'id', description: 'Report Definition ID' })
  @ApiResponse({ status: 200, description: 'Execution history with pagination' })
  @ApiResponse({ status: 404, description: 'Report definition not found' })
  async getExecutions(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.reportsService.getExecutions(id, query);
  }
}
