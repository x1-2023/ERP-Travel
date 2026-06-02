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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Promotions')
@ApiBearerAuth('JWT-auth')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PROMOTIONS
  // GET /api/promotions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all promotions',
    description: 'Get paginated list of promotions with optional filtering and sorting',
  })
  @ApiResponse({ status: 200, description: 'Promotion list with pagination' })
  async findAll(@Query() query: PromotionQueryDto) {
    return this.promotionsService.findAll(query);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET PROMOTION SUMMARY
  // GET /api/promotions/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get promotion summary statistics',
    description: 'Get aggregated statistics for all promotions',
  })
  @ApiResponse({ status: 200, description: 'Promotion summary statistics' })
  async getSummary() {
    return this.promotionsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET SINGLE PROMOTION
  // GET /api/promotions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':id')
  @ApiOperation({
    summary: 'Get promotion by ID',
    description: 'Get detailed promotion information including customer, fund, tactics, and claims',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion details' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE PROMOTION
  // POST /api/promotions
  // ═══════════════════════════════════════════════════════════════════════════
  @Post()
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new promotion',
    description:
      'Create a new promotion in DRAFT status. Requires ADMIN, MANAGER, or FINANCE role.',
  })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createPromotionDto: CreatePromotionDto, @CurrentUser('id') userId: string) {
    return this.promotionsService.create(createPromotionDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE PROMOTION
  // PUT /api/promotions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Put(':id')
  @Roles('ADMIN', 'MANAGER', 'FINANCE')
  @ApiOperation({
    summary: 'Update a promotion',
    description: 'Update promotion details. Only DRAFT or PLANNED promotions can be modified.',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be modified in current status' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.promotionsService.update(id, updatePromotionDto, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE PROMOTION
  // DELETE /api/promotions/:id
  // ═══════════════════════════════════════════════════════════════════════════
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a promotion',
    description:
      'Delete a promotion. Only DRAFT promotions with no claims can be deleted. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be deleted in current status' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promotionsService.remove(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRM PROMOTION
  // POST /api/promotions/:id/confirm
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/confirm')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a promotion',
    description: 'Transition promotion from PLANNED to CONFIRMED status',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be confirmed in current status' })
  async confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promotionsService.confirm(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTE PROMOTION
  // POST /api/promotions/:id/execute
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/execute')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute a promotion',
    description: 'Transition promotion from CONFIRMED to EXECUTING status',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion execution started' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be executed in current status' })
  async execute(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promotionsService.execute(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETE PROMOTION
  // POST /api/promotions/:id/complete
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/complete')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete a promotion',
    description: 'Transition promotion from EXECUTING to COMPLETED status',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion completed successfully' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be completed in current status' })
  async complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promotionsService.complete(id, userId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CANCEL PROMOTION
  // POST /api/promotions/:id/cancel
  // ═══════════════════════════════════════════════════════════════════════════
  @Post(':id/cancel')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a promotion',
    description: 'Cancel a promotion from any status except COMPLETED or already CANCELLED',
  })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Promotion cannot be cancelled in current status' })
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promotionsService.cancel(id, userId);
  }
}
