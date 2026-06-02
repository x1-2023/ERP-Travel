/**
 * Sell Tracking API - Comparison
 * GET /api/operations/sell-tracking/comparison - Compare sell-in vs sell-out
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

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

    // Fetch data
    const records = await prisma.sellTracking.findMany({
      where,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
      orderBy: { period: 'asc' },
    });

    // Group by period for comparison
    const byPeriod = new Map<string, {
      sellInQty: number;
      sellInValue: number;
      sellOutQty: number;
      sellOutValue: number;
      stockQty: number;
      stockValue: number;
    }>();

    for (const r of records) {
      const existing = byPeriod.get(r.period) || {
        sellInQty: 0,
        sellInValue: 0,
        sellOutQty: 0,
        sellOutValue: 0,
        stockQty: 0,
        stockValue: 0,
      };
      existing.sellInQty += r.sellInQty;
      existing.sellInValue += Number(r.sellInValue);
      existing.sellOutQty += r.sellOutQty;
      existing.sellOutValue += Number(r.sellOutValue);
      existing.stockQty += r.stockQty;
      existing.stockValue += Number(r.stockValue);
      byPeriod.set(r.period, existing);
    }

    // Build comparison data
    const comparisonData = Array.from(byPeriod.entries()).map(([period, data]) => ({
      period,
      sellIn: {
        qty: data.sellInQty,
        value: Math.round(data.sellInValue * 100) / 100,
      },
      sellOut: {
        qty: data.sellOutQty,
        value: Math.round(data.sellOutValue * 100) / 100,
      },
      stock: {
        qty: data.stockQty,
        value: Math.round(data.stockValue * 100) / 100,
      },
      sellThroughRate: data.sellInQty > 0
        ? Math.round((data.sellOutQty / data.sellInQty) * 100 * 100) / 100
        : 0,
      stockTurnover: data.stockQty > 0
        ? Math.round((data.sellOutQty / data.stockQty) * 100) / 100
        : 0,
    }));

    // Calculate analysis
    const totalSellIn = records.reduce((sum, r) => sum + r.sellInQty, 0);
    const totalSellOut = records.reduce((sum, r) => sum + r.sellOutQty, 0);
    const totalStock = records.reduce((sum, r) => sum + r.stockQty, 0);
    const totalSellInValue = records.reduce((sum, r) => sum + Number(r.sellInValue), 0);
    const totalSellOutValue = records.reduce((sum, r) => sum + Number(r.sellOutValue), 0);

    const avgSellThroughRate = totalSellIn > 0
      ? Math.round((totalSellOut / totalSellIn) * 100 * 100) / 100
      : 0;

    // Calculate average daily sell-out for days of stock
    const periodsCount = byPeriod.size;
    const avgMonthlySellOut = periodsCount > 0 ? totalSellOut / periodsCount : 0;
    const avgDailySellOut = avgMonthlySellOut / 30;
    const avgDaysOfStock = avgDailySellOut > 0
      ? Math.round((totalStock / periodsCount) / avgDailySellOut)
      : 0;

    // Determine stock trend
    const periods = Array.from(byPeriod.keys());
    let stockTrend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    if (periods.length >= 2) {
      const firstStock = byPeriod.get(periods[0])!.stockQty;
      const lastStock = byPeriod.get(periods[periods.length - 1])!.stockQty;
      const change = firstStock > 0 ? ((lastStock - firstStock) / firstStock) * 100 : 0;
      if (change > 10) stockTrend = 'INCREASING';
      else if (change < -10) stockTrend = 'DECREASING';
    }

    // Calculate growth rates
    let sellInGrowth = 0;
    let sellOutGrowth = 0;
    if (periods.length >= 2) {
      const firstPeriodData = byPeriod.get(periods[0])!;
      const lastPeriodData = byPeriod.get(periods[periods.length - 1])!;

      if (firstPeriodData.sellInQty > 0) {
        sellInGrowth = Math.round(
          ((lastPeriodData.sellInQty - firstPeriodData.sellInQty) / firstPeriodData.sellInQty) * 100 * 100
        ) / 100;
      }
      if (firstPeriodData.sellOutQty > 0) {
        sellOutGrowth = Math.round(
          ((lastPeriodData.sellOutQty - firstPeriodData.sellOutQty) / firstPeriodData.sellOutQty) * 100 * 100
        ) / 100;
      }
    }

    // Generate recommendation
    let recommendation = '';
    if (avgSellThroughRate < 50) {
      recommendation = 'Low sell-through rate. Consider promotional activities or review product assortment.';
    } else if (avgDaysOfStock > 60) {
      recommendation = 'High stock levels. Consider reducing sell-in or running promotions to clear inventory.';
    } else if (avgDaysOfStock < 14) {
      recommendation = 'Low stock coverage. Increase sell-in to avoid stockouts.';
    } else if (avgSellThroughRate >= 80) {
      recommendation = 'Excellent sell-through rate. Maintain current strategy.';
    } else {
      recommendation = 'Performance is within normal range. Monitor for changes.';
    }

    return res.status(200).json({
      data: comparisonData,
      totals: {
        sellIn: {
          qty: totalSellIn,
          value: Math.round(totalSellInValue * 100) / 100,
        },
        sellOut: {
          qty: totalSellOut,
          value: Math.round(totalSellOutValue * 100) / 100,
        },
        stock: {
          qty: totalStock,
          value: Math.round(records.reduce((sum, r) => sum + Number(r.stockValue), 0) * 100) / 100,
        },
      },
      analysis: {
        avgSellThroughRate,
        avgDaysOfStock,
        stockTrend,
        sellInGrowth,
        sellOutGrowth,
        recommendation,
      },
      meta: {
        periodsCovered: periodsCount,
        filters: { customerId, productId, periodFrom, periodTo },
      },
    });
  } catch (error) {
    console.error('Sell tracking comparison error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
