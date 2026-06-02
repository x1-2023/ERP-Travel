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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FundsService } from './funds.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundQueryDto } from './dto/fund-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Funds')
@ApiBearerAuth('JWT-auth')
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST FUNDS
  // GET /api/funds
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all funds',
    description: 'Get paginated list of funds with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Fund list with pagination' })
  async findAll(@Query() query: FundQueryDto) {
    return this.fundsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FUND SUMMARY (aggregated stats)
  // GET /api/funds/summary
  // MUST be before :id route
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get fund summary',
    description: 'Aggregate totalBudget, committed, available by type and year',
  })
  @ApiResponse({ status: 200, description: 'Fund summary statistics' })
  async getSummary(@Query('companyId') companyId?: string) {
    return this.fundsService.getSummary(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AVAILABLE YEARS
  // GET /api/funds/years
  // MUST be before :id route
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('years')
  @ApiOperation({
    summary: 'Get available years',
    description: 'Get list of distinct fiscal years that have funds',
  })
  @ApiResponse({ status: 200, description: 'List of years' })
  async getAvailableYears(@Query('companyId') companyId?: string) {
    return this.fundsService.getAvailableYears(companyId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE FUND
  // GET /api/funds/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get fund by ID',
    description:
      'Get detailed fund information including company, customer, counts, and recent transactions',
  })
  @ApiParam({ name: 'id', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund details' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async findOne(@Param('id') id: string) {
    return this.fundsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE FUND
  // POST /api/funds
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new fund',
    description: 'Create a new fund. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Fund created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 409,
    description: 'Fund with same code and year already exists for this company',
  })
  async create(@Body() createFundDto: CreateFundDto, @CurrentUser('id') userId: string) {
    return this.fundsService.create(createFundDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE FUND
  // PUT /api/funds/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update a fund',
    description: 'Update fund details. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiParam({ name: 'id', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund updated successfully' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async update(@Param('id') id: string, @Body() updateFundDto: UpdateFundDto) {
    return this.fundsService.update(id, updateFundDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE FUND
  // DELETE /api/funds/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a fund',
    description:
      'Delete a fund (only if no promotions or transactions linked). Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund deleted successfully' })
  @ApiResponse({ status: 400, description: 'Fund has linked promotions or transactions' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async remove(@Param('id') id: string) {
    return this.fundsService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE ACTIVE STATUS
  // PATCH /api/funds/:id/toggle-active
  // ═══════════════════════════════════════════════════════════════════════════
  @Patch(':id/toggle-active')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Toggle fund active status',
    description: 'Flip isActive on a fund. Cannot deactivate if fund has active promotions.',
  })
  @ApiParam({ name: 'id', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund active status toggled' })
  @ApiResponse({ status: 400, description: 'Fund has active promotions' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async toggleActive(@Param('id') id: string) {
    return this.fundsService.toggleActive(id);
  }
}
