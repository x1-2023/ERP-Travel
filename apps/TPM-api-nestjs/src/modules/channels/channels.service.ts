import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ChannelInfo {
  value: string;
  label: string;
}

@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);

  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL CHANNELS (Channel enum)
  // ═══════════════════════════════════════════════════════════════════════════
  getChannels(): ChannelInfo[] {
    return [
      { value: 'MT', label: 'Modern Trade' },
      { value: 'GT', label: 'General Trade' },
      { value: 'ECOMMERCE', label: 'E-Commerce' },
      { value: 'HORECA', label: 'HoReCa' },
      { value: 'OTHER', label: 'Other' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST PEPSI CHANNELS (PepsiChannel enum)
  // ═══════════════════════════════════════════════════════════════════════════
  getPepsiChannels(): ChannelInfo[] {
    return [
      { value: 'MT', label: 'Modern Trade' },
      { value: 'GT', label: 'General Trade' },
      { value: 'HORECA', label: 'HoReCa' },
      { value: 'VENDING', label: 'Vending' },
      { value: 'ECOMMERCE', label: 'E-Commerce' },
      { value: 'WHOLESALE', label: 'Wholesale' },
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNT PROMOTIONS BY CHANNEL CODE
  // Promotions link to Customer which has a channel field
  // ═══════════════════════════════════════════════════════════════════════════
  async getPromotionsByChannel(code: string) {
    const channelCode = code.toUpperCase();

    // Validate channel code
    const validChannels = ['MT', 'GT', 'ECOMMERCE', 'HORECA', 'OTHER'];
    if (!validChannels.includes(channelCode)) {
      return {
        channel: channelCode,
        label: 'Unknown',
        promotionCount: 0,
        message: `Invalid channel code. Valid values: ${validChannels.join(', ')}`,
      };
    }

    const channelLabel = this.getChannelLabel(channelCode);

    // Count promotions via Customer.channel
    const count = await this.prisma.promotion.count({
      where: {
        customer: {
          channel: channelCode as any,
        },
      },
    });

    return {
      channel: channelCode,
      label: channelLabel,
      promotionCount: count,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNT CUSTOMERS BY CHANNEL CODE
  // Customer has a channel field (Channel enum)
  // ═══════════════════════════════════════════════════════════════════════════
  async getCustomersByChannel(code: string) {
    const channelCode = code.toUpperCase();

    // Validate channel code
    const validChannels = ['MT', 'GT', 'ECOMMERCE', 'HORECA', 'OTHER'];
    if (!validChannels.includes(channelCode)) {
      return {
        channel: channelCode,
        label: 'Unknown',
        customerCount: 0,
        activeCustomerCount: 0,
        message: `Invalid channel code. Valid values: ${validChannels.join(', ')}`,
      };
    }

    const channelLabel = this.getChannelLabel(channelCode);

    // Count customers by channel
    const [totalCount, activeCount] = await Promise.all([
      this.prisma.customer.count({
        where: {
          channel: channelCode as any,
        },
      }),
      this.prisma.customer.count({
        where: {
          channel: channelCode as any,
          isActive: true,
        },
      }),
    ]);

    return {
      channel: channelCode,
      label: channelLabel,
      customerCount: totalCount,
      activeCustomerCount: activeCount,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANNEL DISTRIBUTION STATS (promotions per channel)
  // ═══════════════════════════════════════════════════════════════════════════
  async getStats() {
    const channels = ['MT', 'GT', 'ECOMMERCE', 'HORECA', 'OTHER'];

    // Get promotion counts per channel (via customer.channel)
    const promotionCounts = await Promise.all(
      channels.map(async (channel) => {
        const count = await this.prisma.promotion.count({
          where: {
            customer: {
              channel: channel as any,
            },
          },
        });
        return { channel, count };
      }),
    );

    // Get customer counts per channel
    const customerCounts = await Promise.all(
      channels.map(async (channel) => {
        const count = await this.prisma.customer.count({
          where: {
            channel: channel as any,
          },
        });
        return { channel, count };
      }),
    );

    const totalPromotions = promotionCounts.reduce((sum, c) => sum + c.count, 0);
    const totalCustomers = customerCounts.reduce((sum, c) => sum + c.count, 0);

    const distribution = channels.map((channel) => {
      const promoCount = promotionCounts.find((p) => p.channel === channel)?.count || 0;
      const custCount = customerCounts.find((c) => c.channel === channel)?.count || 0;

      return {
        channel,
        label: this.getChannelLabel(channel),
        promotionCount: promoCount,
        customerCount: custCount,
        promotionShare: totalPromotions > 0 ? (promoCount / totalPromotions) * 100 : 0,
        customerShare: totalCustomers > 0 ? (custCount / totalCustomers) * 100 : 0,
      };
    });

    return {
      totalPromotions,
      totalCustomers,
      distribution,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  async getSummary() {
    const channels = this.getChannels();
    const pepsiChannels = this.getPepsiChannels();
    const stats = await this.getStats();

    return {
      channels,
      pepsiChannels,
      stats,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Get Channel Label
  // ═══════════════════════════════════════════════════════════════════════════
  private getChannelLabel(code: string): string {
    const labels: Record<string, string> = {
      MT: 'Modern Trade',
      GT: 'General Trade',
      ECOMMERCE: 'E-Commerce',
      HORECA: 'HoReCa',
      OTHER: 'Other',
    };
    return labels[code] || code;
  }
}
