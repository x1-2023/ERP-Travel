import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';

@ApiTags('Channels')
@ApiBearerAuth('JWT-auth')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL CHANNELS
  // GET /api/channels
  // ═══════════════════════════════════════════════════════════════════════════
  @Get()
  @ApiOperation({
    summary: 'List all channels',
    description: 'Get all Channel enum values with human-readable labels',
  })
  @ApiResponse({ status: 200, description: 'List of channels with labels' })
  getChannels() {
    return this.channelsService.getChannels();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PEPSI CHANNELS
  // GET /api/channels/pepsi
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('pepsi')
  @ApiOperation({
    summary: 'List PepsiChannel enum values',
    description:
      'Get all PepsiChannel enum values with labels (MT, GT, HORECA, VENDING, ECOMMERCE, WHOLESALE)',
  })
  @ApiResponse({ status: 200, description: 'List of Pepsi channel values with labels' })
  getPepsiChannels() {
    return this.channelsService.getPepsiChannels();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANNEL DISTRIBUTION STATS
  // GET /api/channels/stats
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('stats')
  @ApiOperation({
    summary: 'Get channel distribution stats',
    description: 'Get promotion and customer counts per channel with distribution percentages',
  })
  @ApiResponse({ status: 200, description: 'Channel distribution statistics' })
  async getStats() {
    return this.channelsService.getStats();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED SUMMARY
  // GET /api/channels/summary
  // ═══════════════════════════════════════════════════════════════════════════
  @Get('summary')
  @ApiOperation({
    summary: 'Get combined channel summary',
    description:
      'Get complete channel overview including Channel enum, PepsiChannel enum, and distribution stats',
  })
  @ApiResponse({ status: 200, description: 'Combined channel summary' })
  async getSummary() {
    return this.channelsService.getSummary();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNT PROMOTIONS BY CHANNEL
  // GET /api/channels/:code/promotions
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':code/promotions')
  @ApiOperation({
    summary: 'Count promotions by channel',
    description: 'Get the number of promotions linked to customers in a specific channel',
  })
  @ApiParam({ name: 'code', description: 'Channel code (MT, GT, ECOMMERCE, HORECA, OTHER)' })
  @ApiResponse({ status: 200, description: 'Promotion count for the channel' })
  async getPromotionsByChannel(@Param('code') code: string) {
    return this.channelsService.getPromotionsByChannel(code);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNT CUSTOMERS BY CHANNEL
  // GET /api/channels/:code/customers
  // ═══════════════════════════════════════════════════════════════════════════
  @Get(':code/customers')
  @ApiOperation({
    summary: 'Count customers by channel',
    description: 'Get the number of customers in a specific channel, with active count',
  })
  @ApiParam({ name: 'code', description: 'Channel code (MT, GT, ECOMMERCE, HORECA, OTHER)' })
  @ApiResponse({ status: 200, description: 'Customer count for the channel' })
  async getCustomersByChannel(@Param('code') code: string) {
    return this.channelsService.getCustomersByChannel(code);
  }
}
