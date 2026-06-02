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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { SettlementQueryDto } from './dto/settlement-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settlements')
@ApiBearerAuth('JWT-auth')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST SETTLEMENTS
  // GET /api/settlements
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all settlements',
    description: 'Get paginated list of settlements with optional date filtering and search',
  })
  @ApiResponse({ status: 200, description: 'Settlement list with pagination' })
  async findAll(@Query() query: SettlementQueryDto) {
    return this.settlementsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SETTLEMENT SUMMARY
  // GET /api/settlements/summary  (MUST be before :id)
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get settlement summary statistics',
    description:
      'Get aggregated statistics: total settled, variance, count, average, and monthly breakdown',
  })
  @ApiResponse({ status: 200, description: 'Settlement summary statistics' })
  async getSummary() {
    return this.settlementsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE SETTLEMENT
  // GET /api/settlements/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get settlement by ID',
    description:
      'Get detailed settlement information including claim, customer, and promotion details',
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ status: 200, description: 'Settlement details' })
  @ApiResponse({ status: 404, description: 'Settlement not found' })
  async findOne(@Param('id') id: string) {
    return this.settlementsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE SETTLEMENT
  // POST /api/settlements
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a settlement',
    description:
      'Create a settlement for an APPROVED claim. Sets claim status to SETTLED. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Settlement created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Claim not in APPROVED status',
  })
  @ApiResponse({
    status: 404,
    description: 'Claim not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Settlement already exists for this claim',
  })
  async create(@Body() createSettlementDto: CreateSettlementDto) {
    return this.settlementsService.create(createSettlementDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE SETTLEMENT
  // PUT /api/settlements/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update a settlement',
    description:
      'Update settlement details. claimId cannot be changed. Variance is auto-recalculated if settledAmount changes. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ status: 200, description: 'Settlement updated successfully' })
  @ApiResponse({ status: 404, description: 'Settlement not found' })
  async update(@Param('id') id: string, @Body() updateSettlementDto: UpdateSettlementDto) {
    return this.settlementsService.update(id, updateSettlementDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE SETTLEMENT
  // DELETE /api/settlements/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a settlement',
    description:
      'Delete a settlement and revert the claim status back to APPROVED. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiResponse({ status: 200, description: 'Settlement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Settlement not found' })
  async remove(@Param('id') id: string) {
    return this.settlementsService.remove(id);
  }
}
