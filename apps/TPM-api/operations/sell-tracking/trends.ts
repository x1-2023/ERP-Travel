/**
 * Sell Tracking API - Trends
 * GET /api/operations/sell-tracking/trends - Get trend analysis
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface PeriodData {
  period: string;
  sellInQty: number;
  sellInValue: number;
  sellOutQty: number;
  sellOutValue: number;
  stockQty: number;
  stockValue: number;
  sellThroughRate: number;
  recordCount: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const {
      customerId,
      productId,
      periods = '12', // Number of periods to analyze
      periodFrom,
      periodTo,
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;

    if (periodFrom || periodTo) {
      where.period = {};
      if (periodFrom) (where.period as Record<string, string>).gte = periodFrom;
      if (periodTo) (where.period as Record<string, string>).lte = periodTo;
    }

    // Get grouped data by period
    const periodData = await prisma.sellTracking.groupBy({
      by: ['period'],
      where,
      _sum: {
        sellInQty: true,
        sellInValue: true,
        sellOutQty: true,
        sellOutValue: true,
        stockQty: true,
        stockValue: true,
      },
      _count: true,
      orderBy: { period: 'desc' },
      take: parseInt(periods),
    });

    // Format period data with calculated metrics
    const formattedPeriods: PeriodData[] = periodData.reverse().map((p) => {
      const sellInQty = p._sum.sellInQty || 0;
      const sellOutQty = p._sum.sellOutQty || 0;
      const sellThroughRate =
        sellInQty > 0 ? Math.round((sellOutQty / sellInQty) * 100 * 100) / 100 : 0;

      return {
        period: p.period,
        sellInQty,
        sellInValue: Number(p._sum.sellInValue || 0),
        sellOutQty,
        sellOutValue: Number(p._sum.sellOutValue || 0),
        stockQty: p._sum.stockQty || 0,
        stockValue: Number(p._sum.stockValue || 0),
        sellThroughRate,
        recordCount: p._count,
      };
    });

    // Calculate period-over-period changes
    const changes = formattedPeriods.map((period, index) => {
      if (index === 0) {
        return {
          period: period.period,
          sellInChange: null,
          sellOutChange: null,
          stockChange: null,
          sellThroughChange: null,
        };
      }

      const prev = formattedPeriods[index - 1];
      return {
        period: period.period,
        sellInChange: prev.sellInQty > 0
          ? Math.round(((period.sellInQty - prev.sellInQty) / prev.sellInQty) * 100)
          : null,
        sellOutChange: prev.sellOutQty > 0
          ? Math.round(((period.sellOutQty - prev.sellOutQty) / prev.sellOutQty) * 100)
          : null,
        stockChange: prev.stockQty > 0
          ? Math.round(((period.stockQty - prev.stockQty) / prev.stockQty) * 100)
          : null,
        sellThroughChange: prev.sellThroughRate > 0
          ? Math.round((period.sellThroughRate - prev.sellThroughRate) * 100) / 100
          : null,
      };
    });

    // Calculate overall trends
    const latestPeriod = formattedPeriods[formattedPeriods.length - 1];
    const firstPeriod = formattedPeriods[0];
    const numPeriods = formattedPeriods.length;

    const overallTrend = numPeriods > 1 ? {
      sellInGrowth: firstPeriod.sellInQty > 0
        ? Math.round(((latestPeriod.sellInQty - firstPeriod.sellInQty) / firstPeriod.sellInQty) * 100)
        : 0,
      sellOutGrowth: firstPeriod.sellOutQty > 0
        ? Math.round(((latestPeriod.sellOutQty - firstPeriod.sellOutQty) / firstPeriod.sellOutQty) * 100)
        : 0,
      stockGrowth: firstPeriod.stockQty > 0
        ? Math.round(((latestPeriod.stockQty - firstPeriod.stockQty) / firstPeriod.stockQty) * 100)
        : 0,
      averageSellThrough: Math.round(
        (formattedPeriods.reduce((sum, p) => sum + p.sellThroughRate, 0) / numPeriods) * 100
      ) / 100,
    } : null;

    // Calculate moving averages (3-period)
    const movingAverages = formattedPeriods.map((period, index) => {
      if (index < 2) return { period: period.period, ma3: null };

      const slice = formattedPeriods.slice(index - 2, index + 1);
      const ma3 = Math.round(slice.reduce((sum, p) => sum + p.sellOutValue, 0) / 3);
      return { period: period.period, ma3 };
    });

    // Get top movers (products or customers with biggest changes)
    let topMovers: { entityId: string; entityName: string; change: number; currentValue: number }[] = [];

    if (formattedPeriods.length >= 2) {
      const latestPeriodStr = latestPeriod.period;
      const prevPeriodStr = formattedPeriods[formattedPeriods.length - 2]?.period;

      if (prevPeriodStr) {
        // Compare by product
        const currentByProduct = await prisma.sellTracking.groupBy({
          by: ['productId'],
          where: { ...where, period: latestPeriodStr },
          _sum: { sellOutValue: true },
        });

        const prevByProduct = await prisma.sellTracking.groupBy({
          by: ['productId'],
          where: { ...where, period: prevPeriodStr },
          _sum: { sellOutValue: true },
        });

        const prevMap = new Map<string, number>(
          prevByProduct.map((p) => [p.productId, Number(p._sum.sellOutValue || 0)])
        );

        const movers = currentByProduct
          .map((current) => {
            const currentValue = Number(current._sum.sellOutValue || 0);
            const prevValue = prevMap.get(current.productId) || 0;
            const change = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
            return { productId: current.productId, change, currentValue };
          })
          .filter((m) => m.change !== 0)
          .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
          .slice(0, 5);

        // Get product names
        const productIds = movers.map((m) => m.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p.name]));

        topMovers = movers.map((m) => ({
          entityId: m.productId,
          entityName: productMap.get(m.productId) || 'Unknown',
          change: Math.round(m.change * 100) / 100,
          currentValue: m.currentValue,
        }));
      }
    }

    return res.status(200).json({
      periods: formattedPeriods,
      changes,
      movingAverages,
      overallTrend,
      topMovers,
      meta: {
        periodsAnalyzed: numPeriods,
        filters: { customerId, productId, periodFrom, periodTo },
      },
    });
  } catch (error) {
    console.error('Sell tracking trends error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
