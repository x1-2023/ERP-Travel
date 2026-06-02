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
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimQueryDto } from './dto/claim-query.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Claims')
@ApiBearerAuth('JWT-auth')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST CLAIMS
  // GET /api/claims
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all claims',
    description: 'Get paginated list of claims with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Claim list with pagination' })
  async findAll(@Query() query: ClaimQueryDto) {
    return this.claimsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET CLAIM SUMMARY
  // GET /api/claims/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get claim summary statistics',
    description: 'Get aggregated statistics for all claims',
  })
  @ApiResponse({ status: 200, description: 'Claim summary statistics' })
  async getSummary() {
    return this.claimsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE CLAIM
  // GET /api/claims/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get claim by ID',
    description:
      'Get detailed claim information including customer, promotion, and related records',
  })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE CLAIM
  // POST /api/claims
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new claim',
    description: 'Create a new claim in PENDING status. Requires ADMIN, MANAGER, or KAM role.',
  })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createClaimDto: CreateClaimDto, @CurrentUser('id') userId: string) {
    return this.claimsService.create(createClaimDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE CLAIM
  // PUT /api/claims/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'KAM')
  @ApiOperation({
    summary: 'Update a claim',
    description: 'Update claim details. Only PENDING claims can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim updated successfully' })
  @ApiResponse({ status: 400, description: 'Claim cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async update(@Param('id') id: string, @Body() updateClaimDto: UpdateClaimDto) {
    return this.claimsService.update(id, updateClaimDto);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE CLAIM
  // DELETE /api/claims/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a claim',
    description:
      'Delete a claim. Only PENDING claims with no linked transactions can be deleted. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim deleted successfully' })
  @ApiResponse({ status: 400, description: 'Claim cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async remove(@Param('id') id: string) {
    return this.claimsService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVE CLAIM
  // POST /api/claims/:id/approve
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve a claim',
    description: 'Approve a PENDING claim. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim approved successfully' })
  @ApiResponse({ status: 400, description: 'Claim is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async approve(
    @Param('id') id: string,
    @Body() reviewDto: ReviewClaimDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.claimsService.approve(id, reviewDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT CLAIM
  // POST /api/claims/:id/reject
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/reject')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject a claim',
    description: 'Reject a PENDING claim. Requires ADMIN or MANAGER role.',
  })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim rejected successfully' })
  @ApiResponse({ status: 400, description: 'Claim is not in PENDING status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async reject(
    @Param('id') id: string,
    @Body() reviewDto: ReviewClaimDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.claimsService.reject(id, reviewDto, userId);
  }
}
