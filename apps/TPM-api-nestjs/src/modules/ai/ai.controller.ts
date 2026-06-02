import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { CreateInsightDto } from './dto/create-insight.dto';
import { AIQueryDto } from './dto/ai-query.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────────────
  // LIST SUGGESTIONS
  // GET /api/ai/suggestions
  // ───────────────────────────────────────────────────────────────────────────
  @Get('suggestions')
  @ApiOperation({
    summary: 'List all AI suggestions',
    description: 'Get paginated list of AI suggestions',
  })
  @ApiResponse({ status: 200, description: 'Suggestion list with pagination' })
  async findAllSuggestions(@Query() query: PaginationDto) {
    return this.aiService.findAllSuggestions(query);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET SINGLE SUGGESTION
  // GET /api/ai/suggestions/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Get('suggestions/:id')
  @ApiOperation({
    summary: 'Get suggestion by ID',
    description: 'Get a single AI suggestion by its ID',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({ status: 200, description: 'Suggestion details' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  async findOneSuggestion(@Param('id') id: string) {
    return this.aiService.findOneSuggestion(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CREATE SUGGESTION
  // POST /api/ai/suggestions
  // ───────────────────────────────────────────────────────────────────────────
  @Post('suggestions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new AI suggestion',
    description: 'Create a new AI suggestion record. User ID is taken from the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Suggestion created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSuggestion(@Body() dto: CreateSuggestionDto, @CurrentUser('id') userId: string) {
    return this.aiService.createSuggestion(dto, userId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACCEPT SUGGESTION
  // POST /api/ai/suggestions/:id/accept
  // ───────────────────────────────────────────────────────────────────────────
  @Post('suggestions/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept an AI suggestion',
    description: 'Mark an AI suggestion as accepted',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({ status: 200, description: 'Suggestion accepted' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  async acceptSuggestion(@Param('id') id: string) {
    return this.aiService.acceptSuggestion(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REJECT SUGGESTION
  // POST /api/ai/suggestions/:id/reject
  // ───────────────────────────────────────────────────────────────────────────
  @Post('suggestions/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject an AI suggestion',
    description: 'Mark an AI suggestion as rejected, optionally with feedback',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({ status: 200, description: 'Suggestion rejected' })
  @ApiResponse({ status: 404, description: 'Suggestion not found' })
  async rejectSuggestion(@Param('id') id: string, @Body('feedback') feedback?: string) {
    return this.aiService.rejectSuggestion(id, feedback);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INSIGHTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ───────────────────────────────────────────────────────────────────────────
  // LIST INSIGHTS
  // GET /api/ai/insights
  // ───────────────────────────────────────────────────────────────────────────
  @Get('insights')
  @ApiOperation({
    summary: 'List all AI insights',
    description: 'Get paginated list of AI insights with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Insight list with pagination' })
  async findAllInsights(@Query() query: AIQueryDto) {
    return this.aiService.findAllInsights(query);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PENDING (UNREAD) INSIGHTS
  // GET /api/ai/insights/pending
  // ───────────────────────────────────────────────────────────────────────────
  @Get('insights/pending')
  @ApiOperation({
    summary: 'Get unread/pending insights',
    description: 'Get all insights that are unread, not dismissed, and not expired',
  })
  @ApiResponse({ status: 200, description: 'List of pending insights' })
  async getUnreadInsights() {
    return this.aiService.getUnreadInsights();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INSIGHTS SUMMARY
  // GET /api/ai/insights/summary
  // ───────────────────────────────────────────────────────────────────────────
  @Get('insights/summary')
  @ApiOperation({
    summary: 'Get insights summary statistics',
    description:
      'Get aggregated statistics for all insights by type, read/unread status, and average confidence',
  })
  @ApiResponse({ status: 200, description: 'Insight summary statistics' })
  async getInsightsSummary() {
    return this.aiService.getSummary();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INSIGHTS FOR ENTITY
  // GET /api/ai/insights/entity/:entityType/:entityId
  // ───────────────────────────────────────────────────────────────────────────
  @Get('insights/entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Get insights for a specific entity',
    description: 'Get all AI insights related to a specific entity (e.g., Promotion, Customer)',
  })
  @ApiParam({ name: 'entityType', description: 'Entity type (e.g., Promotion, Customer, Claim)' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'List of insights for the entity' })
  async getInsightsForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.aiService.getInsightsForEntity(entityType, entityId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET SINGLE INSIGHT
  // GET /api/ai/insights/:id
  // ───────────────────────────────────────────────────────────────────────────
  @Get('insights/:id')
  @ApiOperation({
    summary: 'Get insight by ID',
    description: 'Get a single AI insight by its ID, includes user details',
  })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight details' })
  @ApiResponse({ status: 404, description: 'Insight not found' })
  async findOneInsight(@Param('id') id: string) {
    return this.aiService.findOneInsight(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CREATE INSIGHT
  // POST /api/ai/insights
  // ───────────────────────────────────────────────────────────────────────────
  @Post('insights')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new AI insight',
    description: 'Create a new AI insight record. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Insight created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createInsight(@Body() dto: CreateInsightDto, @CurrentUser('id') userId: string) {
    return this.aiService.createInsight(dto, userId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MARK INSIGHT READ
  // POST /api/ai/insights/:id/read
  // ───────────────────────────────────────────────────────────────────────────
  @Post('insights/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark insight as read',
    description: 'Mark a specific AI insight as read',
  })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight marked as read' })
  @ApiResponse({ status: 404, description: 'Insight not found' })
  async markInsightRead(@Param('id') id: string) {
    return this.aiService.markRead(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // DISMISS INSIGHT
  // POST /api/ai/insights/:id/dismiss
  // ───────────────────────────────────────────────────────────────────────────
  @Post('insights/:id/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dismiss an insight',
    description: 'Dismiss a specific AI insight so it no longer appears in pending',
  })
  @ApiParam({ name: 'id', description: 'Insight ID' })
  @ApiResponse({ status: 200, description: 'Insight dismissed' })
  @ApiResponse({ status: 404, description: 'Insight not found' })
  async dismissInsight(@Param('id') id: string) {
    return this.aiService.dismiss(id);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GENERATE MOCK INSIGHTS
  // POST /api/ai/insights/generate
  // ───────────────────────────────────────────────────────────────────────────
  @Post('insights/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate mock/demo insights',
    description: 'Generate a set of sample AI insights for demonstration purposes',
  })
  @ApiResponse({ status: 201, description: 'Mock insights generated successfully' })
  async generateMockInsights(@CurrentUser('id') userId: string) {
    return this.aiService.generateMockInsights(userId);
  }
}
