import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST TRANSACTIONS
  // GET /api/transactions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all transactions',
    description:
      'Get paginated list of transactions with optional filtering by type, fund, promotion, claim, and date range',
  })
  @ApiResponse({ status: 200, description: 'Transaction list with pagination' })
  async findAll(@Query() query: TransactionQueryDto) {
    return this.paymentsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TRANSACTION SUMMARY
  // GET /api/transactions/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get transaction summary statistics',
    description:
      'Get aggregated statistics: counts and totals by type, by fund, overall totals, and date range',
  })
  @ApiResponse({ status: 200, description: 'Transaction summary statistics' })
  async getSummary() {
    return this.paymentsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TRANSACTIONS BY FUND
  // GET /api/transactions/by-fund/:fundId
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('by-fund/:fundId')
  @ApiOperation({
    summary: 'Get transactions for a specific fund',
    description:
      'Get all transactions recorded against a specific fund, ordered by most recent first',
  })
  @ApiParam({ name: 'fundId', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Transactions for the specified fund' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async getByFund(@Param('fundId') fundId: string) {
    return this.paymentsService.getByFund(fundId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE TRANSACTION
  // GET /api/transactions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description:
      'Get detailed transaction information including fund, promotion, and claim details',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TRANSACTION
  // POST /api/transactions
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create an immutable ledger entry. Automatically updates the linked fund balances (committed/available). ' +
      'Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or fund not active' })
  @ApiResponse({ status: 404, description: 'Fund, promotion, or claim not found' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.create(createTransactionDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE TRANSACTION (ADJUSTMENT only)
  // DELETE /api/transactions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a transaction (ADJUSTMENT type only)',
    description:
      'Delete an ADJUSTMENT transaction and reverse its fund impact. ' +
      'Only ADJUSTMENT transactions can be deleted. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted and fund impact reversed' })
  @ApiResponse({ status: 400, description: 'Only ADJUSTMENT transactions can be deleted' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
