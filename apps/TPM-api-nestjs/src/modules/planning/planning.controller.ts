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
import { PlanningService } from './planning.service';
import { ScenarioQueryDto } from './dto/scenario-query.dto';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { BaselineQueryDto } from './dto/baseline-query.dto';
import { CreateBaselineDto } from './dto/create-baseline.dto';
import { UpdateBaselineDto } from './dto/update-baseline.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Planning')
@ApiBearerAuth('JWT-auth')
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANNING SUMMARY
  // GET /api/planning/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get planning overview statistics',
    description: 'Get aggregated statistics for scenarios and baselines',
  })
  @ApiResponse({ status: 200, description: 'Planning overview statistics' })
  async getSummary() {
    return this.planningService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FISCAL PERIOD CALENDAR
  // GET /api/planning/calendar
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('calendar')
  @ApiOperation({
    summary: 'Get fiscal period calendar',
    description: 'Get fiscal period calendar with optional year and company filters',
  })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Fiscal period calendar data' })
  async getCalendar(@Query('year') year?: number, @Query('companyId') companyId?: string) {
    return this.planningService.getCalendar(year ? Number(year) : undefined, companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST SCENARIOS
  // GET /api/planning/scenarios
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('scenarios')
  @ApiOperation({
    summary: 'List all scenarios',
    description: 'Get paginated list of scenarios with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Scenario list with pagination' })
  async findAllScenarios(@Query() query: ScenarioQueryDto) {
    return this.planningService.findAllScenarios(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SCENARIO BY ID
  // GET /api/planning/scenarios/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('scenarios/:id')
  @ApiOperation({
    summary: 'Get scenario by ID',
    description: 'Get detailed scenario information including versions and baseline',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario details' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async findOneScenario(@Param('id') id: string) {
    return this.planningService.findOneScenario(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SCENARIO
  // POST /api/planning/scenarios
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('scenarios')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new scenario',
    description: 'Create a new scenario in DRAFT status with initial version',
  })
  @ApiResponse({ status: 201, description: 'Scenario created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createScenario(@Body() dto: CreateScenarioDto, @CurrentUser('id') userId: string) {
    return this.planningService.createScenario(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE SCENARIO
  // PUT /api/planning/scenarios/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('scenarios/:id')
  @ApiOperation({
    summary: 'Update a scenario',
    description: 'Update scenario details. Only DRAFT scenarios can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario updated successfully' })
  @ApiResponse({ status: 400, description: 'Scenario cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async updateScenario(
    @Param('id') id: string,
    @Body() dto: UpdateScenarioDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.planningService.updateScenario(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RUN SCENARIO
  // POST /api/planning/scenarios/:id/run
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('scenarios/:id/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run a scenario',
    description: 'Start running a DRAFT scenario simulation',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario run started' })
  @ApiResponse({ status: 400, description: 'Scenario cannot be run in current status' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async runScenario(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.planningService.runScenario(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE SCENARIO
  // POST /api/planning/scenarios/:id/complete
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('scenarios/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a scenario',
    description: 'Mark a RUNNING scenario as COMPLETED',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario completed' })
  @ApiResponse({ status: 400, description: 'Scenario must be in RUNNING status' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async completeScenario(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.planningService.completeScenario(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIVE SCENARIO
  // POST /api/planning/scenarios/:id/archive
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('scenarios/:id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a scenario',
    description: 'Move a scenario to ARCHIVED status',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario archived' })
  @ApiResponse({ status: 400, description: 'Scenario is already archived' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async archiveScenario(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.planningService.archiveScenario(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE SCENARIO
  // DELETE /api/planning/scenarios/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete('scenarios/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a scenario',
    description: 'Delete a scenario. Only DRAFT scenarios can be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Scenario ID' })
  @ApiResponse({ status: 200, description: 'Scenario deleted successfully' })
  @ApiResponse({ status: 400, description: 'Scenario cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Scenario not found' })
  async deleteScenario(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.planningService.deleteScenario(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST BASELINES
  // GET /api/planning/baselines
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('baselines')
  @ApiOperation({
    summary: 'List all baselines',
    description: 'Get paginated list of baselines with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'Baseline list with pagination' })
  async findAllBaselines(@Query() query: BaselineQueryDto) {
    return this.planningService.findAllBaselines(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET BASELINE BY ID
  // GET /api/planning/baselines/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('baselines/:id')
  @ApiOperation({
    summary: 'Get baseline by ID',
    description: 'Get detailed baseline information with related scenarios',
  })
  @ApiParam({ name: 'id', description: 'Baseline ID' })
  @ApiResponse({ status: 200, description: 'Baseline details' })
  @ApiResponse({ status: 404, description: 'Baseline not found' })
  async findOneBaseline(@Param('id') id: string) {
    return this.planningService.findOneBaseline(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE BASELINE
  // POST /api/planning/baselines
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('baselines')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new baseline',
    description: 'Create a new baseline data record',
  })
  @ApiResponse({ status: 201, description: 'Baseline created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createBaseline(@Body() dto: CreateBaselineDto, @CurrentUser('id') userId: string) {
    return this.planningService.createBaseline(dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE BASELINE
  // PUT /api/planning/baselines/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('baselines/:id')
  @ApiOperation({
    summary: 'Update a baseline',
    description: 'Update baseline data. Locked baselines cannot be updated.',
  })
  @ApiParam({ name: 'id', description: 'Baseline ID' })
  @ApiResponse({ status: 200, description: 'Baseline updated successfully' })
  @ApiResponse({ status: 400, description: 'Baseline is locked' })
  @ApiResponse({ status: 404, description: 'Baseline not found' })
  async updateBaseline(
    @Param('id') id: string,
    @Body() dto: UpdateBaselineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.planningService.updateBaseline(id, dto, userId);
  }
}
