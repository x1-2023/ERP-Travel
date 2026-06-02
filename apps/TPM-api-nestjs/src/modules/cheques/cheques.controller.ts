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
import { ChequesService } from './cheques.service';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { UpdateChequeDto } from './dto/update-cheque.dto';
import { ChequeQueryDto } from './dto/cheque-query.dto';
import { VoidChequeDto } from './dto/void-cheque.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cheques')
@ApiBearerAuth('JWT-auth')
@Controller('cheques')
export class ChequesController {
  constructor(private readonly chequesService: ChequesService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST CHEQUES
  // GET /api/cheques
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all cheques',
    description:
      'Get paginated list of cheques with optional filtering by status, payee, claim, date range, and search',
  })
  @ApiResponse({ status: 200, description: 'Cheque list with pagination' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ISSUED', 'CLEARED', 'BOUNCED', 'VOIDED', 'EXPIRED'],
  })
  @ApiQuery({ name: 'payeeId', required: false, description: 'Filter by payee (Customer) ID' })
  @ApiQuery({ name: 'claimId', required: false, description: 'Filter by linked Claim ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by cheque number or memo' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Issue date from (ISO date)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Issue date to (ISO date)' })
  async findAll(@Query() query: ChequeQueryDto) {
    return this.chequesService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CHEQUE SUMMARY
  // GET /api/cheques/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get cheque summary statistics',
    description: 'Get aggregated statistics for all cheques grouped by status with amounts',
  })
  @ApiResponse({ status: 200, description: 'Cheque summary statistics' })
  async getSummary() {
    return this.chequesService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET EXPIRING CHEQUES
  // GET /api/cheques/expiring
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('expiring')
  @ApiOperation({
    summary: 'Get expiring cheques',
    description: 'Get ISSUED cheques nearing due date (within 7 days)',
  })
  @ApiResponse({ status: 200, description: 'List of expiring cheques' })
  async getExpiring() {
    return this.chequesService.getExpiring();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE CHEQUE
  // GET /api/cheques/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get cheque by ID',
    description: 'Get detailed cheque information including payee and claim details',
  })
  @ApiParam({ name: 'id', description: 'Cheque ID' })
  @ApiResponse({ status: 200, description: 'Cheque details' })
  @ApiResponse({ status: 404, description: 'Cheque not found' })
  async findOne(@Param('id') id: string) {
    return this.chequesService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE CHEQUE
  // POST /api/cheques
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new cheque',
    description: 'Create a new cheque in ISSUED status, linked to a payee and optionally a claim',
  })
  @ApiResponse({ status: 201, description: 'Cheque created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createChequeDto: CreateChequeDto) {
    return this.chequesService.create(createChequeDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CHEQUE
  // PUT /api/cheques/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update a cheque',
    description: 'Update cheque details. Only ISSUED cheques can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Cheque ID' })
  @ApiResponse({ status: 200, description: 'Cheque updated successfully' })
  @ApiResponse({ status: 400, description: 'Cheque cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Cheque not found' })
  async update(@Param('id') id: string, @Body() updateChequeDto: UpdateChequeDto) {
    return this.chequesService.update(id, updateChequeDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR CHEQUE
  // POST /api/cheques/:id/clear
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/clear')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear a cheque',
    description: 'Mark an ISSUED cheque as CLEARED and set clearedAt timestamp',
  })
  @ApiParam({ name: 'id', description: 'Cheque ID' })
  @ApiResponse({ status: 200, description: 'Cheque cleared successfully' })
  @ApiResponse({ status: 400, description: 'Cheque is not in ISSUED status' })
  @ApiResponse({ status: 404, description: 'Cheque not found' })
  async clear(@Param('id') id: string) {
    return this.chequesService.clear(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOUNCE CHEQUE
  // POST /api/cheques/:id/bounce
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/bounce')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bounce a cheque',
    description: 'Mark an ISSUED cheque as BOUNCED',
  })
  @ApiParam({ name: 'id', description: 'Cheque ID' })
  @ApiResponse({ status: 200, description: 'Cheque bounced successfully' })
  @ApiResponse({ status: 400, description: 'Cheque is not in ISSUED status' })
  @ApiResponse({ status: 404, description: 'Cheque not found' })
  async bounce(@Param('id') id: string) {
    return this.chequesService.bounce(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VOID CHEQUE
  // POST /api/cheques/:id/void
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/void')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Void a cheque',
    description: 'Mark an ISSUED or BOUNCED cheque as VOIDED. Requires a void reason.',
  })
  @ApiParam({ name: 'id', description: 'Cheque ID' })
  @ApiResponse({ status: 200, description: 'Cheque voided successfully' })
  @ApiResponse({ status: 400, description: 'Cheque cannot be voided in current status' })
  @ApiResponse({ status: 404, description: 'Cheque not found' })
  async voidCheque(@Param('id') id: string, @Body() voidChequeDto: VoidChequeDto) {
    return this.chequesService.void(id, voidChequeDto);
  }
}
