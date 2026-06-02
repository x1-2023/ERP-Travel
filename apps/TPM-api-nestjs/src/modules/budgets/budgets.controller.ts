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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ApproveBudgetDto, RejectBudgetDto } from './dto/approve-budget.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth('JWT-auth')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST BUDGETS
  // GET /api/budgets
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all budgets',
    description: 'Get paginated list of budgets with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Budget list with pagination' })
  async findAll(@Query() query: BudgetQueryDto) {
    return this.budgetsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET BUDGET SUMMARY
  // GET /api/budgets/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get budget summary statistics',
    description: 'Get aggregated statistics for all budgets or filtered by year',
  })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Budget summary statistics' })
  async getSummary(@Query('year') year?: number) {
    return this.budgetsService.getSummary(year);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AVAILABLE YEARS
  // GET /api/budgets/years
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('years')
  @ApiOperation({
    summary: 'Get available fiscal years',
    description: 'Get list of fiscal years that have budgets',
  })
  @ApiResponse({ status: 200, description: 'List of fiscal years' })
  async getYears() {
    return this.budgetsService.getAvailableYears();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET BUDGET CATEGORIES
  // GET /api/budgets/categories
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('categories')
  @ApiOperation({
    summary: 'Get budget categories',
    description: 'Get list of all budget categories',
  })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.budgetsService.getCategories();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE BUDGET
  // GET /api/budgets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get budget by ID',
    description: 'Get detailed budget information including allocations and activities',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget details' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE BUDGET
  // POST /api/budgets
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new budget',
    description: 'Create a new budget in DRAFT status. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Budget already exists for this period' })
  async create(@Body() createBudgetDto: CreateBudgetDto, @CurrentUser('id') userId: string) {
    return this.budgetsService.create(createBudgetDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE BUDGET
  // PUT /api/budgets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update a budget',
    description: 'Update budget details. Only DRAFT budgets can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 400, description: 'Budget cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.update(id, updateBudgetDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE BUDGET
  // DELETE /api/budgets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a budget',
    description: 'Delete a budget. Only DRAFT or CANCELLED budgets can be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 400, description: 'Budget cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.remove(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBMIT FOR APPROVAL
  // POST /api/budgets/:id/submit
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/submit')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit budget for approval',
    description: 'Submit a DRAFT budget for approval workflow',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget submitted for approval' })
  @ApiResponse({ status: 400, description: 'Budget cannot be submitted in current status' })
  async submit(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.submitForApproval(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE BUDGET
  // POST /api/budgets/:id/approve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a budget',
    description: 'Approve a pending budget. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget approved successfully' })
  @ApiResponse({ status: 400, description: 'Budget is not pending approval' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.approve(id, approveDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT BUDGET
  // POST /api/budgets/:id/reject
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/reject')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a budget',
    description: 'Reject a pending budget and return to DRAFT. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget rejected successfully' })
  @ApiResponse({ status: 400, description: 'Budget is not pending approval' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.reject(id, rejectDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLOSE BUDGET
  // POST /api/budgets/:id/close
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/close')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Close a budget',
    description: 'Close an active budget. No more spending allowed after closing.',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget closed successfully' })
  @ApiResponse({ status: 400, description: 'Budget cannot be closed in current status' })
  async close(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.close(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ALLOCATIONS
  // GET /api/budgets/:id/allocations
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id/allocations')
  @ApiOperation({
    summary: 'Get budget allocations',
    description: 'Get all allocations for a specific budget',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'List of allocations' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async getAllocations(@Param('id') id: string) {
    return this.budgetsService.getAllocations(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE ALLOCATION
  // POST /api/budgets/:id/allocations
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/allocations')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create budget allocation',
    description: 'Add a new allocation to a DRAFT budget',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 201, description: 'Allocation created successfully' })
  @ApiResponse({ status: 400, description: 'Cannot add allocation or exceeds budget' })
  async createAllocation(
    @Param('id') id: string,
    @Body() allocationDto: CreateAllocationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.createAllocation(id, allocationDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE ALLOCATION
  // DELETE /api/budgets/:id/allocations/:allocationId
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id/allocations/:allocationId')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete budget allocation',
    description: 'Remove an allocation from a DRAFT budget',
  })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiParam({ name: 'allocationId', description: 'Allocation ID' })
  @ApiResponse({ status: 200, description: 'Allocation deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove allocation in current status' })
  async deleteAllocation(
    @Param('id') id: string,
    @Param('allocationId') allocationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.budgetsService.deleteAllocation(id, allocationId, userId);
  }
}
