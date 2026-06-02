import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { AccrualQueryDto } from './dto/accrual-query.dto';
import { CreateAccrualDto } from './dto/create-accrual.dto';
import { JournalQueryDto } from './dto/journal-query.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { CreateGLAccountDto } from './dto/create-gl-account.dto';
import { UpdateAccrualConfigDto } from './dto/update-accrual-config.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reconciliation')
@ApiBearerAuth('JWT-auth')
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // RECONCILIATION SUMMARY
  // GET /api/reconciliation/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get reconciliation overview',
    description: 'Get aggregated totals for accruals, journals, and accounts',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reconciliation overview statistics' })
  async getSummary(@Query('companyId') companyId?: string) {
    return this.reconciliationService.getSummary(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ACCRUAL CONFIG
  // GET /api/reconciliation/config
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('config')
  @ApiOperation({
    summary: 'Get accrual configuration',
    description: 'Get accrual configuration for a company',
  })
  @ApiQuery({ name: 'companyId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Accrual configuration' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async getConfig(@Query('companyId') companyId: string) {
    return this.reconciliationService.getConfig(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ACCRUAL CONFIG
  // PUT /api/reconciliation/config
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('config')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({
    summary: 'Update accrual configuration',
    description: 'Update or create accrual configuration for a company',
  })
  @ApiResponse({ status: 200, description: 'Accrual configuration updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async updateConfig(@Body() dto: UpdateAccrualConfigDto) {
    return this.reconciliationService.updateConfig(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ACCRUALS
  // GET /api/reconciliation/accruals
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('accruals')
  @ApiOperation({
    summary: 'List accrual entries',
    description: 'Get paginated list of accrual entries with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Accrual entry list with pagination' })
  async findAllAccruals(@Query() query: AccrualQueryDto) {
    return this.reconciliationService.findAllAccruals(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ACCRUAL BY ID
  // GET /api/reconciliation/accruals/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('accruals/:id')
  @ApiOperation({
    summary: 'Get accrual entry by ID',
    description: 'Get detailed accrual entry with journal information',
  })
  @ApiParam({ name: 'id', description: 'Accrual Entry ID' })
  @ApiResponse({ status: 200, description: 'Accrual entry details' })
  @ApiResponse({ status: 404, description: 'Accrual entry not found' })
  async findOneAccrual(@Param('id') id: string) {
    return this.reconciliationService.findOneAccrual(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE ACCRUAL
  // POST /api/reconciliation/accruals
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('accruals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create accrual entry',
    description: 'Create a new accrual entry in PENDING status',
  })
  @ApiResponse({ status: 201, description: 'Accrual entry created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createAccrual(@Body() dto: CreateAccrualDto, @CurrentUser('id') userId: string) {
    return this.reconciliationService.createAccrual(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST ACCRUAL TO GL
  // POST /api/reconciliation/accruals/:id/post
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('accruals/:id/post')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Post accrual entry to GL',
    description: 'Post a PENDING accrual entry, setting status to POSTED',
  })
  @ApiParam({ name: 'id', description: 'Accrual Entry ID' })
  @ApiResponse({ status: 200, description: 'Accrual entry posted' })
  @ApiResponse({ status: 400, description: 'Accrual must be in PENDING status' })
  @ApiResponse({ status: 404, description: 'Accrual entry not found' })
  async postAccrual(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reconciliationService.postAccrual(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVERSE ACCRUAL
  // POST /api/reconciliation/accruals/:id/reverse
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('accruals/:id/reverse')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reverse accrual entry',
    description: 'Create a reversal entry for a POSTED accrual',
  })
  @ApiParam({ name: 'id', description: 'Accrual Entry ID' })
  @ApiResponse({ status: 200, description: 'Accrual entry reversed' })
  @ApiResponse({ status: 400, description: 'Accrual must be in POSTED status' })
  @ApiResponse({ status: 404, description: 'Accrual entry not found' })
  async reverseAccrual(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reconciliationService.reverseAccrual(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST JOURNALS
  // GET /api/reconciliation/journals
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('journals')
  @ApiOperation({
    summary: 'List GL journals',
    description: 'Get paginated list of GL journals with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Journal list with pagination' })
  async findAllJournals(@Query() query: JournalQueryDto) {
    return this.reconciliationService.findAllJournals(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET JOURNAL BY ID
  // GET /api/reconciliation/journals/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('journals/:id')
  @ApiOperation({
    summary: 'Get journal by ID',
    description: 'Get detailed journal with lines',
  })
  @ApiParam({ name: 'id', description: 'Journal ID' })
  @ApiResponse({ status: 200, description: 'Journal details with lines' })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  async findOneJournal(@Param('id') id: string) {
    return this.reconciliationService.findOneJournal(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE JOURNAL WITH LINES
  // POST /api/reconciliation/journals
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('journals')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create GL journal with lines',
    description: 'Create a new GL journal entry with journal lines',
  })
  @ApiResponse({ status: 201, description: 'Journal created with lines' })
  @ApiResponse({ status: 400, description: 'Validation error or debit/credit mismatch' })
  async createJournal(@Body() dto: CreateJournalDto, @CurrentUser('id') userId: string) {
    return this.reconciliationService.createJournal(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST JOURNAL
  // POST /api/reconciliation/journals/:id/post
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('journals/:id/post')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Post journal',
    description: 'Post a DRAFT or PENDING_APPROVAL journal',
  })
  @ApiParam({ name: 'id', description: 'Journal ID' })
  @ApiResponse({ status: 200, description: 'Journal posted' })
  @ApiResponse({ status: 400, description: 'Journal cannot be posted in current status' })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  async postJournal(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reconciliationService.postJournal(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVERSE JOURNAL
  // POST /api/reconciliation/journals/:id/reverse
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('journals/:id/reverse')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reverse journal',
    description: 'Create a reversal journal for a POSTED journal',
  })
  @ApiParam({ name: 'id', description: 'Journal ID' })
  @ApiResponse({ status: 200, description: 'Journal reversed' })
  @ApiResponse({ status: 400, description: 'Journal must be in POSTED status' })
  @ApiResponse({ status: 404, description: 'Journal not found' })
  async reverseJournal(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reconciliationService.reverseJournal(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST GL ACCOUNTS
  // GET /api/reconciliation/accounts
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('accounts')
  @ApiOperation({
    summary: 'List GL accounts',
    description: 'Get list of GL accounts, optionally filtered by company',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of GL accounts' })
  async findAllAccounts(@Query('companyId') companyId?: string) {
    return this.reconciliationService.findAllAccounts(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE GL ACCOUNT
  // POST /api/reconciliation/accounts
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('accounts')
  @Roles('ADMIN', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create GL account',
    description: 'Create a new GL account',
  })
  @ApiResponse({ status: 201, description: 'GL account created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createAccount(@Body() dto: CreateGLAccountDto) {
    return this.reconciliationService.createAccount(dto);
  }
}
