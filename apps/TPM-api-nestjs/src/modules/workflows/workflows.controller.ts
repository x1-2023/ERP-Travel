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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateApprovalRuleDto } from './dto/create-approval-rule.dto';
import { UpdateApprovalRuleDto } from './dto/update-approval-rule.dto';
import { WorkflowQueryDto } from './dto/workflow-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workflows')
@ApiBearerAuth('JWT-auth')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST APPROVAL RULES
  // GET /api/workflows/rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('rules')
  @ApiOperation({
    summary: 'List all approval rules',
    description: 'Get paginated list of approval rules with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Approval rule list with pagination' })
  async findAll(@Query() query: WorkflowQueryDto) {
    return this.workflowsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET APPROVAL RULE TYPES
  // GET /api/workflows/rules/types
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('rules/types')
  @ApiOperation({
    summary: 'Get approval rule types',
    description: 'Get list of all available approval rule type enum values',
  })
  @ApiResponse({ status: 200, description: 'List of approval rule types' })
  getTypes() {
    return this.workflowsService.getTypes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FIND MATCHING RULE
  // GET /api/workflows/rules/match
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('rules/match')
  @ApiOperation({
    summary: 'Find matching approval rule',
    description: 'Find which approval rule applies for a given amount and optional channel',
  })
  @ApiQuery({
    name: 'amount',
    required: true,
    type: Number,
    description: 'Amount to match against',
  })
  @ApiQuery({ name: 'channel', required: false, type: String, description: 'Channel to filter by' })
  @ApiResponse({ status: 200, description: 'Matching rule or no-match result' })
  async findMatchingRule(@Query('amount') amount: string, @Query('channel') channel?: string) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return { matched: false, message: 'Invalid amount provided' };
    }
    return this.workflowsService.findMatchingRule(parsedAmount, channel);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE APPROVAL RULE
  // GET /api/workflows/rules/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('rules/:id')
  @ApiOperation({
    summary: 'Get approval rule by ID',
    description: 'Get detailed approval rule information',
  })
  @ApiParam({ name: 'id', description: 'Approval Rule ID' })
  @ApiResponse({ status: 200, description: 'Approval rule details' })
  @ApiResponse({ status: 404, description: 'Approval rule not found' })
  async findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE APPROVAL RULE
  // POST /api/workflows/rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('rules')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new approval rule',
    description: 'Create a new approval rule. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Approval rule created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Approval rule name already exists' })
  async create(@Body() createDto: CreateApprovalRuleDto, @CurrentUser('id') userId: string) {
    return this.workflowsService.create(createDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE APPROVAL RULE
  // PUT /api/workflows/rules/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('rules/:id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update an approval rule',
    description: 'Update approval rule details. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Approval Rule ID' })
  @ApiResponse({ status: 200, description: 'Approval rule updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Approval rule not found' })
  @ApiResponse({ status: 409, description: 'Name conflict' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateApprovalRuleDto) {
    return this.workflowsService.update(id, updateDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE APPROVAL RULE
  // DELETE /api/workflows/rules/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete('rules/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an approval rule',
    description: 'Permanently delete an approval rule. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Approval Rule ID' })
  @ApiResponse({ status: 200, description: 'Approval rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Approval rule not found' })
  async remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE ACTIVE STATUS
  // PATCH /api/workflows/rules/:id/toggle-active
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch('rules/:id/toggle-active')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Toggle approval rule active status',
    description: 'Flip the isActive flag on an approval rule. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Approval Rule ID' })
  @ApiResponse({ status: 200, description: 'Active status toggled' })
  @ApiResponse({ status: 404, description: 'Approval rule not found' })
  async toggleActive(@Param('id') id: string) {
    return this.workflowsService.toggleActive(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SUMMARY / STATS
  // GET /api/workflows/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get workflow summary statistics',
    description: 'Get aggregated statistics about approval rules',
  })
  @ApiResponse({ status: 200, description: 'Workflow summary statistics' })
  async getSummary() {
    return this.workflowsService.getSummary();
  }
}
