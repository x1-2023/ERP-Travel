import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST AUDIT LOGS
  // GET /api/audit
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'List all audit logs',
    description:
      'Get paginated list of immutable audit logs with optional filtering and sorting. Requires ADMIN role.',
  })
  @ApiResponse({ status: 200, description: 'Audit log list with pagination' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AUDIT SUMMARY
  // GET /api/audit/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get audit log summary statistics',
    description:
      'Get aggregated statistics including counts by action, entity type, and user. Requires ADMIN role.',
  })
  @ApiResponse({ status: 200, description: 'Audit summary statistics' })
  async getSummary() {
    return this.auditService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AVAILABLE ACTIONS
  // GET /api/audit/actions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('actions')
  @ApiOperation({
    summary: 'Get available audit action types',
    description: 'Returns the list of all AuditAction enum values.',
  })
  @ApiResponse({ status: 200, description: 'List of audit action enum values' })
  getActions() {
    return this.auditService.getActions();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ENTITY TYPES
  // GET /api/audit/entity-types
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('entity-types')
  @ApiOperation({
    summary: 'Get distinct entity types',
    description: 'Returns the list of distinct entity types found in audit logs.',
  })
  @ApiResponse({ status: 200, description: 'List of distinct entity types' })
  async getEntityTypes() {
    return this.auditService.getEntityTypes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AUDIT LOGS BY ENTITY
  // GET /api/audit/entity/:entityType/:entityId
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('entity/:entityType/:entityId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Get audit logs for a specific entity',
    description:
      'Returns all audit log entries for a specific entity type and ID, ordered by timestamp descending. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'entityType', description: 'Entity type (e.g., Promotion, Claim)' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Audit logs for the entity' })
  async findByEntity(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE AUDIT LOG
  // GET /api/audit/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get audit log by ID',
    description:
      'Get detailed audit log entry including user and company information. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE AUDIT LOG (programmatic / internal use)
  // POST /api/audit
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create an audit log entry',
    description:
      'Create a new immutable audit log entry. Sequence number and hash chain are computed automatically. Primarily for internal/programmatic use. Requires ADMIN role.',
  })
  @ApiResponse({ status: 201, description: 'Audit log created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.create(createAuditLogDto);
  }
}
