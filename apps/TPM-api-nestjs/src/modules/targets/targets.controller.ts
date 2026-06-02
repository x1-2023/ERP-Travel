import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TargetsService } from './targets.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { TargetQueryDto } from './dto/target-query.dto';
import { CreateTargetAllocationDto } from './dto/create-target-allocation.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Targets')
@ApiBearerAuth('JWT-auth')
@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST TARGETS
  // GET /api/targets
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all targets',
    description: 'Get paginated list of targets with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Target list with pagination' })
  async findAll(@Query() query: TargetQueryDto) {
    return this.targetsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TARGET SUMMARY
  // GET /api/targets/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get target summary statistics',
    description: 'Get aggregated statistics for all targets',
  })
  @ApiResponse({ status: 200, description: 'Target summary statistics' })
  async getSummary() {
    return this.targetsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AVAILABLE YEARS
  // GET /api/targets/years
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('years')
  @ApiOperation({
    summary: 'Get available years',
    description: 'Get list of years that have targets',
  })
  @ApiResponse({ status: 200, description: 'List of years' })
  async getAvailableYears() {
    return this.targetsService.getAvailableYears();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE TARGET
  // GET /api/targets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get target by ID',
    description: 'Get detailed target information including allocations',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Target details' })
  @ApiResponse({ status: 404, description: 'Target not found' })
  async findOne(@Param('id') id: string) {
    return this.targetsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TARGET
  // POST /api/targets
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new target',
    description: 'Create a new target in DRAFT status. Requires ADMIN or MANAGER role.',
  })
  @ApiResponse({ status: 201, description: 'Target created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Target with this code already exists' })
  async create(@Body() createTargetDto: CreateTargetDto, @CurrentUser('id') userId: string) {
    return this.targetsService.create(createTargetDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE TARGET
  // PUT /api/targets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Update a target',
    description: 'Update target details. Only DRAFT targets can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Target updated successfully' })
  @ApiResponse({ status: 400, description: 'Target cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Target not found' })
  async update(@Param('id') id: string, @Body() updateTargetDto: UpdateTargetDto) {
    return this.targetsService.update(id, updateTargetDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE TARGET
  // DELETE /api/targets/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a target',
    description: 'Delete a target. Only DRAFT targets can be deleted. Cascades to allocations.',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Target deleted successfully' })
  @ApiResponse({ status: 400, description: 'Target cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Target not found' })
  async remove(@Param('id') id: string) {
    return this.targetsService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVATE TARGET
  // POST /api/targets/:id/activate
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/activate')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate a target',
    description: 'Transition a DRAFT target to ACTIVE status. totalTarget must be > 0.',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Target activated successfully' })
  @ApiResponse({ status: 400, description: 'Target cannot be activated' })
  async activate(@Param('id') id: string) {
    return this.targetsService.activate(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE TARGET
  // POST /api/targets/:id/complete
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/complete')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a target',
    description: 'Transition an ACTIVE target to COMPLETED status.',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Target completed successfully' })
  @ApiResponse({ status: 400, description: 'Target cannot be completed' })
  async complete(@Param('id') id: string) {
    return this.targetsService.complete(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE ACHIEVED VALUE
  // PATCH /api/targets/:id/achieved
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch(':id/achieved')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update target achieved value',
    description: 'Update the totalAchieved value for an ACTIVE target.',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'Achieved value updated successfully' })
  @ApiResponse({ status: 400, description: 'Target is not active' })
  async updateAchieved(@Param('id') id: string, @Body('totalAchieved') totalAchieved: number) {
    return this.targetsService.updateAchieved(id, totalAchieved);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE TARGET ALLOCATION
  // POST /api/targets/:id/allocations
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/allocations')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create target allocation',
    description: 'Add a new allocation to a target for a geographic unit',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 201, description: 'Allocation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Allocation for this geographic unit already exists' })
  async createAllocation(
    @Param('id') id: string,
    @Body() allocationDto: CreateTargetAllocationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.targetsService.createAllocation(id, allocationDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET TARGET ALLOCATIONS
  // GET /api/targets/:id/allocations
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id/allocations')
  @ApiOperation({
    summary: 'Get target allocations',
    description: 'Get all allocations for a specific target',
  })
  @ApiParam({ name: 'id', description: 'Target ID' })
  @ApiResponse({ status: 200, description: 'List of allocations' })
  @ApiResponse({ status: 404, description: 'Target not found' })
  async getAllocations(@Param('id') id: string) {
    return this.targetsService.getAllocations(id);
  }
}
