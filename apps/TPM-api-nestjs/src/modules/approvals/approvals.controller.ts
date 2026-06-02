import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApprovalQueryDto } from './dto/approval-query.dto';
import { ApproveRejectDto } from './dto/approve-reject.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Approvals')
@ApiBearerAuth('JWT-auth')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST APPROVALS
  // GET /api/approvals
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all approvals',
    description:
      'Get paginated list of budget approvals with optional filtering by status, budgetId, reviewerId, and level',
  })
  @ApiResponse({ status: 200, description: 'Approval list with pagination' })
  async findAll(@Query() query: ApprovalQueryDto) {
    return this.approvalsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET APPROVAL SUMMARY
  // GET /api/approvals/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get approval summary statistics',
    description: 'Get aggregated statistics for all approvals grouped by status',
  })
  @ApiResponse({ status: 200, description: 'Approval summary statistics' })
  async getSummary() {
    return this.approvalsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET PENDING APPROVALS FOR REVIEWER
  // GET /api/approvals/pending/:reviewerId
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('pending/:reviewerId')
  @ApiOperation({
    summary: 'Get pending approvals for a reviewer',
    description:
      'Get all approvals in UNDER_REVIEW or SUBMITTED status assigned to a specific reviewer',
  })
  @ApiParam({ name: 'reviewerId', description: 'Reviewer user ID' })
  @ApiResponse({ status: 200, description: 'List of pending approvals for the reviewer' })
  async getPendingForReviewer(@Param('reviewerId') reviewerId: string) {
    return this.approvalsService.getPendingForReviewer(reviewerId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET APPROVALS FOR BUDGET
  // GET /api/approvals/budget/:budgetId
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('budget/:budgetId')
  @ApiOperation({
    summary: 'Get approvals for a specific budget',
    description: 'Get all approval records for a given budget, ordered by level',
  })
  @ApiParam({ name: 'budgetId', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'List of approvals for the budget' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async getForBudget(@Param('budgetId') budgetId: string) {
    return this.approvalsService.getForBudget(budgetId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE APPROVAL
  // GET /api/approvals/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get approval by ID',
    description: 'Get detailed approval information including related budget data',
  })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiResponse({ status: 200, description: 'Approval details' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  async findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE APPROVAL REQUEST
  // POST /api/approvals
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new approval request',
    description: 'Create a new budget approval request. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Approval created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate approval' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async create(@Body() createDto: CreateApprovalDto) {
    return this.approvalsService.create(createDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE
  // POST /api/approvals/:id/approve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve an approval request',
    description:
      'Set approval status to APPROVED with reviewedAt timestamp. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiResponse({ status: 200, description: 'Approval approved successfully' })
  @ApiResponse({ status: 400, description: 'Approval cannot be approved in current status' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.approvalsService.approve(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT
  // POST /api/approvals/:id/reject
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/reject')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject an approval request',
    description:
      'Set approval status to REJECTED with reviewedAt timestamp and comments. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiResponse({ status: 200, description: 'Approval rejected successfully' })
  @ApiResponse({ status: 400, description: 'Approval cannot be rejected in current status' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  async reject(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.approvalsService.reject(id, dto, userId);
  }
}
