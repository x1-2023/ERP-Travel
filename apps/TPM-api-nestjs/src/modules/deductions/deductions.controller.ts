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
import { DeductionsService } from './deductions.service';
import { DeductionQueryDto } from './dto/deduction-query.dto';
import { CreateDeductionDto } from './dto/create-deduction.dto';
import { UpdateDeductionDto } from './dto/update-deduction.dto';
import { MatchDeductionDto } from './dto/match-deduction.dto';
import { ResolveDeductionDto } from './dto/resolve-deduction.dto';
import { WriteOffDeductionDto } from './dto/write-off-deduction.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateDeductionDocumentDto } from './dto/create-deduction-document.dto';
import { CreateWriteOffRuleDto } from './dto/create-write-off-rule.dto';
import { UpdateWriteOffRuleDto } from './dto/update-write-off-rule.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Deductions')
@ApiBearerAuth('JWT-auth')
@Controller('deductions')
export class DeductionsController {
  constructor(private readonly deductionsService: DeductionsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST DEDUCTIONS
  // GET /api/deductions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all deductions',
    description:
      'Get paginated list of deductions with optional filtering by status, category, source, customer, and date range',
  })
  @ApiResponse({ status: 200, description: 'Deduction list with pagination' })
  async findAll(@Query() query: DeductionQueryDto) {
    return this.deductionsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEDUCTION SUMMARY
  // GET /api/deductions/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get deduction summary statistics',
    description: 'Get aggregated statistics by status and category with amounts',
  })
  @ApiResponse({ status: 200, description: 'Deduction summary statistics' })
  async getSummary() {
    return this.deductionsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEDUCTION AGING
  // GET /api/deductions/aging
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('aging')
  @ApiOperation({
    summary: 'Get deduction aging breakdown',
    description: 'Get aging breakdown of open deductions (0-30, 31-60, 61-90, 90+ days)',
  })
  @ApiResponse({ status: 200, description: 'Deduction aging breakdown' })
  async getAging() {
    return this.deductionsService.getAging();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST WRITE-OFF RULES
  // GET /api/deductions/write-off-rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('write-off-rules')
  @ApiOperation({
    summary: 'List write-off rules',
    description: 'Get all write-off rules for automatic deduction write-offs',
  })
  @ApiResponse({ status: 200, description: 'Write-off rule list' })
  async listWriteOffRules() {
    return this.deductionsService.listWriteOffRules();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE WRITE-OFF RULE
  // POST /api/deductions/write-off-rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('write-off-rules')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a write-off rule',
    description: 'Create a new write-off rule. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Write-off rule created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createWriteOffRule(@Body() dto: CreateWriteOffRuleDto, @CurrentUser('id') userId: string) {
    return this.deductionsService.createWriteOffRule(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE WRITE-OFF RULE
  // PUT /api/deductions/write-off-rules/:ruleId
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('write-off-rules/:ruleId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a write-off rule',
    description: 'Update an existing write-off rule. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'ruleId', description: 'Write-off rule ID' })
  @ApiResponse({ status: 200, description: 'Write-off rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Write-off rule not found' })
  async updateWriteOffRule(@Param('ruleId') ruleId: string, @Body() dto: UpdateWriteOffRuleDto) {
    return this.deductionsService.updateWriteOffRule(ruleId, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE DEDUCTION
  // GET /api/deductions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get deduction by ID',
    description:
      'Get detailed deduction information including customer, disputes, documents, comments, and activities',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction details' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async findOne(@Param('id') id: string) {
    return this.deductionsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE DEDUCTION
  // POST /api/deductions
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new deduction',
    description: 'Create a new deduction in PENDING status. Requires ADMIN, MANAGER, or KAM role.',
  })
  @ApiResponse({ status: 201, description: 'Deduction created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateDeductionDto, @CurrentUser('id') userId: string) {
    return this.deductionsService.create(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE DEDUCTION
  // PUT /api/deductions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @ApiOperation({
    summary: 'Update a deduction',
    description: 'Update deduction details. Only PENDING deductions can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction updated successfully' })
  @ApiResponse({ status: 400, description: 'Deduction cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeductionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.update(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MATCH DEDUCTION
  // POST /api/deductions/:id/match
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/match')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Match deduction to promotion and claim',
    description:
      'Match a deduction to a promotion and optionally a claim. Sets match method, score, and timestamp.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction matched successfully' })
  @ApiResponse({ status: 400, description: 'Deduction cannot be matched in current status' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async match(
    @Param('id') id: string,
    @Body() dto: MatchDeductionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.match(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE DEDUCTION
  // POST /api/deductions/:id/approve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a matched deduction',
    description: 'Approve a deduction that has been matched. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction approved successfully' })
  @ApiResponse({ status: 400, description: 'Deduction is not in MATCHED status' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.deductionsService.approve(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESOLVE DEDUCTION
  // POST /api/deductions/:id/resolve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/resolve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve a deduction',
    description: 'Resolve a deduction with resolution type, resolved amount, and variance amount.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction resolved successfully' })
  @ApiResponse({ status: 400, description: 'Deduction cannot be resolved in current status' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDeductionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.resolve(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE OFF DEDUCTION
  // POST /api/deductions/:id/write-off
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/write-off')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Write off a deduction',
    description: 'Write off a deduction. Requires a write-off reason.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Deduction written off successfully' })
  @ApiResponse({ status: 400, description: 'Deduction cannot be written off in current status' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async writeOff(
    @Param('id') id: string,
    @Body() dto: WriteOffDeductionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.writeOff(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE DISPUTE
  // POST /api/deductions/:id/disputes
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/disputes')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a dispute for a deduction',
    description: 'Create a new dispute against a deduction. Sets the deduction status to DISPUTED.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async createDispute(
    @Param('id') id: string,
    @Body() dto: CreateDisputeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.createDispute(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE DISPUTE
  // PUT /api/deductions/:id/disputes/:disputeId
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id/disputes/:disputeId')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @ApiOperation({
    summary: 'Update a dispute',
    description: 'Update a dispute for a deduction. Cannot update RESOLVED or CLOSED disputes.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiParam({ name: 'disputeId', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Dispute updated successfully' })
  @ApiResponse({ status: 400, description: 'Dispute cannot be updated in current status' })
  @ApiResponse({ status: 404, description: 'Deduction or dispute not found' })
  async updateDispute(
    @Param('id') id: string,
    @Param('disputeId') disputeId: string,
    @Body() dto: UpdateDisputeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.updateDispute(id, disputeId, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESOLVE DISPUTE
  // POST /api/deductions/:id/disputes/:disputeId/resolve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/disputes/:disputeId/resolve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve a dispute',
    description:
      'Resolve a dispute for a deduction. When all disputes are resolved, the deduction moves to UNDER_REVIEW.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiParam({ name: 'disputeId', description: 'Dispute ID' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  @ApiResponse({ status: 400, description: 'Dispute is already resolved or closed' })
  @ApiResponse({ status: 404, description: 'Deduction or dispute not found' })
  async resolveDispute(
    @Param('id') id: string,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.resolveDispute(id, disputeId, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST COMMENTS
  // GET /api/deductions/:id/comments
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id/comments')
  @ApiOperation({
    summary: 'List comments for a deduction',
    description: 'Get all comments for a deduction, ordered by most recent first',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Comment list' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async listComments(@Param('id') id: string) {
    return this.deductionsService.listComments(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD COMMENT
  // POST /api/deductions/:id/comments
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a comment to a deduction',
    description: 'Add a comment to a deduction. Can be marked as internal-only.',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.createComment(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST DOCUMENTS
  // GET /api/deductions/:id/documents
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id/documents')
  @ApiOperation({
    summary: 'List documents for a deduction',
    description: 'Get all documents attached to a deduction',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 200, description: 'Document list' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async listDocuments(@Param('id') id: string) {
    return this.deductionsService.listDocuments(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD DOCUMENT
  // POST /api/deductions/:id/documents
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add document metadata to a deduction',
    description: 'Register document metadata for a deduction (simulates upload, no actual S3)',
  })
  @ApiParam({ name: 'id', description: 'Deduction ID' })
  @ApiResponse({ status: 201, description: 'Document metadata added successfully' })
  @ApiResponse({ status: 404, description: 'Deduction not found' })
  async addDocument(
    @Param('id') id: string,
    @Body() dto: CreateDeductionDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.deductionsService.addDocument(id, dto, userId);
  }
}
