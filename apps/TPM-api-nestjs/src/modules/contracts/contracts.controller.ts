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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractQueryDto } from './dto/contract-query.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { RecordProgressDto } from './dto/record-progress.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST CONTRACTS
  // GET /api/contracts
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all contracts',
    description:
      'Get paginated list of volume contracts with optional filtering by status, customer, channel, region, risk level, and search',
  })
  @ApiResponse({ status: 200, description: 'Contract list with pagination' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
  })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'channel', required: false, description: 'Filter by channel' })
  @ApiQuery({ name: 'region', required: false, description: 'Filter by region' })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['ON_TRACK', 'AT_RISK', 'CRITICAL'] })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by code, name, or customer name',
  })
  async findAll(@Query() query: ContractQueryDto) {
    return this.contractsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CONTRACT SUMMARY
  // GET /api/contracts/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get contract summary statistics',
    description: 'Get aggregated statistics for all contracts grouped by status with volumes',
  })
  @ApiResponse({ status: 200, description: 'Contract summary statistics' })
  async getSummary() {
    return this.contractsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET AT-RISK CONTRACTS
  // GET /api/contracts/at-risk
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('at-risk')
  @ApiOperation({
    summary: 'Get at-risk contracts',
    description:
      'Get active contracts with AT_RISK or CRITICAL risk level, including next upcoming milestone',
  })
  @ApiResponse({ status: 200, description: 'List of at-risk contracts' })
  async getAtRisk() {
    return this.contractsService.getAtRisk();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE CONTRACT
  // GET /api/contracts/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get contract by ID',
    description:
      'Get detailed contract information including customer, milestones, and progress data',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract details' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE CONTRACT
  // POST /api/contracts
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new contract',
    description:
      'Create a new volume contract in DRAFT status. Requires ADMIN, MANAGER, or KAM role.',
  })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CONTRACT
  // PUT /api/contracts/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @ApiOperation({
    summary: 'Update a contract',
    description: 'Update contract details. Only DRAFT contracts can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  @ApiResponse({ status: 400, description: 'Contract cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVATE CONTRACT
  // POST /api/contracts/:id/activate
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/activate')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate a contract',
    description: 'Transition a DRAFT contract to ACTIVE status. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract activated successfully' })
  @ApiResponse({ status: 400, description: 'Contract is not in DRAFT status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async activate(@Param('id') id: string) {
    return this.contractsService.activate(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE CONTRACT
  // POST /api/contracts/:id/complete
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/complete')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a contract',
    description:
      'Transition an ACTIVE contract to COMPLETED status. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract completed successfully' })
  @ApiResponse({ status: 400, description: 'Contract is not in ACTIVE status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async complete(@Param('id') id: string) {
    return this.contractsService.complete(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCEL CONTRACT
  // POST /api/contracts/:id/cancel
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/cancel')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a contract',
    description: 'Cancel a DRAFT or ACTIVE contract. Cannot cancel completed contracts.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Contract cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async cancel(@Param('id') id: string) {
    return this.contractsService.cancel(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADD MILESTONE
  // POST /api/contracts/:id/milestones
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/milestones')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a milestone to a contract',
    description: 'Add a volume milestone (e.g. Q1, H1, FY) to a contract',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 201, description: 'Milestone added successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async addMilestone(@Param('id') id: string, @Body() createMilestoneDto: CreateMilestoneDto) {
    return this.contractsService.addMilestone(id, createMilestoneDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORD PROGRESS
  // POST /api/contracts/:id/progress
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/progress')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Record monthly progress',
    description:
      'Record or update monthly volume progress for a contract. Upserts by year and month. Only ACTIVE contracts.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Progress recorded successfully' })
  @ApiResponse({ status: 400, description: 'Contract is not in ACTIVE status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async recordProgress(@Param('id') id: string, @Body() recordProgressDto: RecordProgressDto) {
    return this.contractsService.recordProgress(id, recordProgressDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE CONTRACT
  // DELETE /api/contracts/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a contract',
    description: 'Delete a contract. Only DRAFT contracts can be deleted. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  @ApiResponse({ status: 400, description: 'Contract cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
