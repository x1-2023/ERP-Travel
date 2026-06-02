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
import { RegionsService } from './regions.service';
import { CreateGeographicUnitDto } from './dto/create-geographic-unit.dto';
import { UpdateGeographicUnitDto } from './dto/update-geographic-unit.dto';
import { GeographicUnitQueryDto } from './dto/geographic-unit-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Geographic Units')
@ApiBearerAuth('JWT-auth')
@Controller('geographic-units')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST GEOGRAPHIC UNITS
  // GET /api/geographic-units
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all geographic units',
    description:
      'Get paginated list of geographic units with optional filtering by level, parent, and active status',
  })
  @ApiResponse({ status: 200, description: 'Geographic unit list with pagination' })
  async findAll(@Query() query: GeographicUnitQueryDto) {
    return this.regionsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET HIERARCHY (full tree)
  // GET /api/geographic-units/hierarchy
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('hierarchy')
  @ApiOperation({
    summary: 'Get geographic hierarchy tree',
    description: 'Get the full geographic hierarchy as a nested tree structure',
  })
  @ApiResponse({ status: 200, description: 'Full hierarchy tree' })
  async getHierarchy() {
    return this.regionsService.getHierarchy();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET LEVELS (enum values)
  // GET /api/geographic-units/levels
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('levels')
  @ApiOperation({
    summary: 'Get geographic levels',
    description: 'Get list of all geographic level enum values with labels',
  })
  @ApiResponse({ status: 200, description: 'List of geographic levels' })
  async getLevels() {
    return this.regionsService.getLevels();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE GEOGRAPHIC UNIT
  // GET /api/geographic-units/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get geographic unit by ID',
    description:
      'Get detailed geographic unit information including parent, children, and relation counts',
  })
  @ApiParam({ name: 'id', description: 'Geographic Unit ID' })
  @ApiResponse({ status: 200, description: 'Geographic unit details' })
  @ApiResponse({ status: 404, description: 'Geographic unit not found' })
  async findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE GEOGRAPHIC UNIT
  // POST /api/geographic-units
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new geographic unit',
    description: 'Create a new geographic unit. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Geographic unit created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid parent level' })
  @ApiResponse({ status: 409, description: 'Geographic unit with same code already exists' })
  async create(@Body() createDto: CreateGeographicUnitDto) {
    return this.regionsService.create(createDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE GEOGRAPHIC UNIT
  // PUT /api/geographic-units/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a geographic unit',
    description:
      'Update geographic unit details. Code is immutable. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Geographic Unit ID' })
  @ApiResponse({ status: 200, description: 'Geographic unit updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parent level constraint' })
  @ApiResponse({ status: 404, description: 'Geographic unit not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateGeographicUnitDto) {
    return this.regionsService.update(id, updateDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE GEOGRAPHIC UNIT
  // DELETE /api/geographic-units/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a geographic unit',
    description:
      'Delete a geographic unit. Cannot delete if it has children or budget allocations. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Geographic Unit ID' })
  @ApiResponse({ status: 200, description: 'Geographic unit deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete unit with children or budget allocations',
  })
  @ApiResponse({ status: 404, description: 'Geographic unit not found' })
  async remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }
}
