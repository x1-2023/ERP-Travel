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
import { SettingsService } from './settings.service';
import { SOXControlQueryDto } from './dto/sox-control-query.dto';
import { CreateSOXControlDto } from './dto/create-sox-control.dto';
import { UpdateSOXControlDto } from './dto/update-sox-control.dto';
import { SOXViolationQueryDto } from './dto/sox-violation-query.dto';
import { ReviewViolationDto } from './dto/review-violation.dto';
import { CreateClashRuleDto } from './dto/create-clash-rule.dto';
import { UpdateClashRuleDto } from './dto/update-clash-rule.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS OVERVIEW
  // GET /api/settings/overview
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('overview')
  @ApiOperation({
    summary: 'Get settings overview',
    description: 'Get combined settings overview with counts of controls, rules, and violations',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Settings overview statistics' })
  async getOverview(@Query('companyId') companyId?: string) {
    return this.settingsService.getOverview(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST SOX CONTROLS
  // GET /api/settings/sox-controls
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('sox-controls')
  @ApiOperation({
    summary: 'List SOX controls',
    description: 'Get paginated list of SOX controls with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'SOX control list with pagination' })
  async findAllSOXControls(@Query() query: SOXControlQueryDto) {
    return this.settingsService.findAllSOXControls(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SOX CONTROL BY ID
  // GET /api/settings/sox-controls/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('sox-controls/:id')
  @ApiOperation({
    summary: 'Get SOX control by ID',
    description: 'Get detailed SOX control with violations',
  })
  @ApiParam({ name: 'id', description: 'SOX Control ID' })
  @ApiResponse({ status: 200, description: 'SOX control details' })
  @ApiResponse({ status: 404, description: 'SOX control not found' })
  async findOneSOXControl(@Param('id') id: string) {
    return this.settingsService.findOneSOXControl(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SOX CONTROL
  // POST /api/settings/sox-controls
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('sox-controls')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create SOX control',
    description: 'Create a new SOX compliance control. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'SOX control created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSOXControl(@Body() dto: CreateSOXControlDto) {
    return this.settingsService.createSOXControl(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE SOX CONTROL
  // PUT /api/settings/sox-controls/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('sox-controls/:id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update SOX control',
    description: 'Update an existing SOX control. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'SOX Control ID' })
  @ApiResponse({ status: 200, description: 'SOX control updated' })
  @ApiResponse({ status: 404, description: 'SOX control not found' })
  async updateSOXControl(@Param('id') id: string, @Body() dto: UpdateSOXControlDto) {
    return this.settingsService.updateSOXControl(id, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST SOX CONTROL
  // POST /api/settings/sox-controls/:id/test
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('sox-controls/:id/test')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test SOX control',
    description: 'Run a test on a SOX control and update lastTestedAt/lastTestResult',
  })
  @ApiParam({ name: 'id', description: 'SOX Control ID' })
  @ApiResponse({ status: 200, description: 'SOX control tested' })
  @ApiResponse({ status: 404, description: 'SOX control not found' })
  async testSOXControl(@Param('id') id: string) {
    return this.settingsService.testSOXControl(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST SOX VIOLATIONS
  // GET /api/settings/sox-violations
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('sox-violations')
  @ApiOperation({
    summary: 'List SOX violations',
    description: 'Get paginated list of SOX violations with optional filtering',
  })
  @ApiResponse({ status: 200, description: 'SOX violation list with pagination' })
  async findAllSOXViolations(@Query() query: SOXViolationQueryDto) {
    return this.settingsService.findAllSOXViolations(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEW SOX VIOLATION
  // POST /api/settings/sox-violations/:id/review
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('sox-violations/:id/review')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Review SOX violation',
    description: 'Review a SOX violation with notes. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'SOX Violation ID' })
  @ApiResponse({ status: 200, description: 'Violation reviewed' })
  @ApiResponse({ status: 400, description: 'Violation already reviewed' })
  @ApiResponse({ status: 404, description: 'Violation not found' })
  async reviewViolation(
    @Param('id') id: string,
    @Body() dto: ReviewViolationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.settingsService.reviewViolation(id, dto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MARK VIOLATION AS EXCEPTION
  // POST /api/settings/sox-violations/:id/except
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('sox-violations/:id/except')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark violation as exception',
    description: 'Mark a SOX violation as an approved exception. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'SOX Violation ID' })
  @ApiResponse({ status: 200, description: 'Violation marked as exception' })
  @ApiResponse({ status: 404, description: 'Violation not found' })
  async exceptViolation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.settingsService.exceptViolation(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST CLASH RULES
  // GET /api/settings/clash-rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('clash-rules')
  @ApiOperation({
    summary: 'List clash rules',
    description: 'Get list of clash rules, optionally filtered by company',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of clash rules' })
  async findAllClashRules(@Query('companyId') companyId?: string) {
    return this.settingsService.findAllClashRules(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE CLASH RULE
  // POST /api/settings/clash-rules
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('clash-rules')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create clash rule',
    description: 'Create a new clash detection rule. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Clash rule created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createClashRule(@Body() dto: CreateClashRuleDto) {
    return this.settingsService.createClashRule(dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CLASH RULE
  // PUT /api/settings/clash-rules/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put('clash-rules/:id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update clash rule',
    description: 'Update an existing clash rule. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Clash Rule ID' })
  @ApiResponse({ status: 200, description: 'Clash rule updated' })
  @ApiResponse({ status: 404, description: 'Clash rule not found' })
  async updateClashRule(@Param('id') id: string, @Body() dto: UpdateClashRuleDto) {
    return this.settingsService.updateClashRule(id, dto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE CLASH RULE ACTIVE
  // POST /api/settings/clash-rules/:id/toggle
  // ═══════════════════════════════════════════════════════════════════════════
  @Post('clash-rules/:id/toggle')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle clash rule active status',
    description: 'Toggle a clash rule between active and inactive. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Clash Rule ID' })
  @ApiResponse({ status: 200, description: 'Clash rule toggled' })
  @ApiResponse({ status: 404, description: 'Clash rule not found' })
  async toggleClashRule(@Param('id') id: string) {
    return this.settingsService.toggleClashRule(id);
  }
}
