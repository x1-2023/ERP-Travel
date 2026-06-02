import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { ImportQueryDto } from './dto/import-query.dto';
import { CreateImportDto } from './dto/create-import.dto';
import { FiscalPeriodQueryDto } from './dto/fiscal-period-query.dto';
import { CreateFiscalPeriodDto } from './dto/create-fiscal-period.dto';
import { OpsSyncJobQueryDto } from './dto/sync-job-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Operations')
@ApiBearerAuth('JWT-auth')
@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // IMPORT BATCHES
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('imports')
  @ApiOperation({
    summary: 'List import batches',
    description: 'Get paginated list of deduction import batches',
  })
  @ApiResponse({ status: 200, description: 'Import batch list with pagination' })
  async findAllImports(@Query() query: ImportQueryDto) {
    return this.operationsService.findAllImports(query);
  }

  @Get('imports/:id')
  @ApiOperation({
    summary: 'Get import batch by ID',
    description: 'Get detailed import batch information',
  })
  @ApiParam({ name: 'id', description: 'Import Batch ID' })
  @ApiResponse({ status: 200, description: 'Import batch details' })
  @ApiResponse({ status: 404, description: 'Import batch not found' })
  async findOneImport(@Param('id') id: string) {
    return this.operationsService.findOneImport(id);
  }

  @Post('imports')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create import batch',
    description: 'Create a new deduction import batch. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Import batch created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createImport(@Body() dto: CreateImportDto, @CurrentUser('id') userId: string) {
    return this.operationsService.createImport(dto, userId);
  }

  @Post('imports/:id/process')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start processing import batch',
    description:
      'Start processing a PENDING import batch. Updates status to PROCESSING. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Import Batch ID' })
  @ApiResponse({ status: 200, description: 'Processing started' })
  @ApiResponse({ status: 400, description: 'Batch is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'Import batch not found' })
  async processImport(@Param('id') id: string) {
    return this.operationsService.processImport(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FISCAL PERIODS
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('fiscal-periods')
  @ApiOperation({
    summary: 'List fiscal periods',
    description: 'Get paginated list of fiscal periods with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Fiscal period list with pagination' })
  async findAllFiscalPeriods(@Query() query: FiscalPeriodQueryDto) {
    return this.operationsService.findAllFiscalPeriods(query);
  }

  @Get('fiscal-periods/:id')
  @ApiOperation({
    summary: 'Get fiscal period by ID',
    description: 'Get detailed fiscal period information',
  })
  @ApiParam({ name: 'id', description: 'Fiscal Period ID' })
  @ApiResponse({ status: 200, description: 'Fiscal period details' })
  @ApiResponse({ status: 404, description: 'Fiscal period not found' })
  async findOneFiscalPeriod(@Param('id') id: string) {
    return this.operationsService.findOneFiscalPeriod(id);
  }

  @Post('fiscal-periods')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create fiscal period',
    description: 'Create a new fiscal period. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Fiscal period created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createFiscalPeriod(@Body() dto: CreateFiscalPeriodDto) {
    return this.operationsService.createFiscalPeriod(dto);
  }

  @Post('fiscal-periods/:id/close')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Close fiscal period',
    description: 'Close a fiscal period (SOFT_CLOSE or HARD_CLOSE). Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Fiscal Period ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['SOFT_CLOSE', 'HARD_CLOSE'],
    description: 'Close type (default: SOFT_CLOSE)',
  })
  @ApiResponse({ status: 200, description: 'Period closed' })
  @ApiResponse({ status: 400, description: 'Period cannot be closed in current status' })
  @ApiResponse({ status: 404, description: 'Fiscal period not found' })
  async closeFiscalPeriod(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('type') closeType?: 'SOFT_CLOSE' | 'HARD_CLOSE',
  ) {
    return this.operationsService.closeFiscalPeriod(id, userId, closeType || 'SOFT_CLOSE');
  }

  @Post('fiscal-periods/:id/reopen')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reopen fiscal period',
    description: 'Reopen a SOFT_CLOSE fiscal period back to OPEN. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Fiscal Period ID' })
  @ApiResponse({ status: 200, description: 'Period reopened' })
  @ApiResponse({
    status: 400,
    description: 'Period cannot be reopened (already open or hard-closed)',
  })
  @ApiResponse({ status: 404, description: 'Fiscal period not found' })
  async reopenFiscalPeriod(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.operationsService.reopenFiscalPeriod(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC JOBS (read-only)
  // ═══════════════════════════════════════════════════════════════════════════

  @Get('sync-jobs')
  @ApiOperation({
    summary: 'List recent sync jobs',
    description: 'Get paginated list of recent sync jobs (read-only view)',
  })
  @ApiResponse({ status: 200, description: 'Sync job list with pagination' })
  async findAllSyncJobs(@Query() query: OpsSyncJobQueryDto) {
    return this.operationsService.findAllSyncJobs(query);
  }

  @Get('sync-jobs/summary')
  @ApiOperation({
    summary: 'Get sync job statistics',
    description: 'Get aggregated sync job statistics by status',
  })
  @ApiResponse({ status: 200, description: 'Sync job summary statistics' })
  async getSyncJobSummary() {
    return this.operationsService.getSyncJobSummary();
  }
}
