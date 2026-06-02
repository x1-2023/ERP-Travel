/**
 * Sell Tracking API - Sell-Out Analysis
 * GET /api/operations/sell-tracking/sell-out - Analyze sell-out data
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
      categoryId,
      periodFrom,
      periodTo,
      groupBy = 'period', // 'customer' | 'product' | 'category' | 'period'
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;
    if (categoryId) {
      where.product = { categoryId };
    }
    if (periodFrom || periodTo) {
      where.period = {};
      if (periodFrom) (where.period as Record<string, string>).gte = periodFrom;
      if (periodTo) (where.period as Record<string, string>).lte = periodTo;
    }

    // Fetch data
    const records = await prisma.sellTracking.findMany({
      where,
      include: {
        customer: { select: { id: true, code: true, name: true, channel: true } },
        product: { select: { id: true, sku: true, name: true, category: true, brand: true } },
      },
      orderBy: { period: 'desc' },
    });

    // Calculate totals
    const totals = {
      quantity: records.reduce((sum, r) => sum + r.sellOutQty, 0),
      value: records.reduce((sum, r) => sum + Number(r.sellOutValue), 0),
    };

    // Group data based on groupBy parameter
    let groupedData: Array<{
      groupKey: string;
      groupName: string;
      quantity: number;
      value: number;
      recordCount: number;
      sellThroughRate?: number;
      growthPercent?: number;
    }> = [];

    if (groupBy === 'customer') {
      const byCustomer = new Map<string, { name: string; sellIn: number; sellOut: number; value: number; count: number }>();
      for (const r of records) {
        const key = r.customerId;
        const existing = byCustomer.get(key) || { name: r.customer?.name || '', sellIn: 0, sellOut: 0, value: 0, count: 0 };
        existing.sellIn += r.sellInQty;
        existing.sellOut += r.sellOutQty;
        existing.value += Number(r.sellOutValue);
        existing.count++;
        byCustomer.set(key, existing);
      }
      groupedData = Array.from(byCustomer.entries()).map(([key, data]) => ({
        groupKey: key,
        groupName: data.name,
        quantity: data.sellOut,
        value: Math.round(data.value * 100) / 100,
        recordCount: data.count,
        sellThroughRate: data.sellIn > 0 ? Math.round((data.sellOut / data.sellIn) * 100 * 100) / 100 : 0,
      }));
    } else if (groupBy === 'product') {
      const byProduct = new Map<string, { name: string; sellIn: number; sellOut: number; value: number; count: number }>();
      for (const r of records) {
        const key = r.productId;
        const existing = byProduct.get(key) || { name: r.product?.name || '', sellIn: 0, sellOut: 0, value: 0, count: 0 };
        existing.sellIn += r.sellInQty;
        existing.sellOut += r.sellOutQty;
        existing.value += Number(r.sellOutValue);
        existing.count++;
        byProduct.set(key, existing);
      }
      groupedData = Array.from(byProduct.entries()).map(([key, data]) => ({
        groupKey: key,
        groupName: data.name,
        quantity: data.sellOut,
        value: Math.round(data.value * 100) / 100,
        recordCount: data.count,
        sellThroughRate: data.sellIn > 0 ? Math.round((data.sellOut / data.sellIn) * 100 * 100) / 100 : 0,
      }));
    } else if (groupBy === 'category') {
      const byCategory = new Map<string, { sellIn: number; sellOut: number; value: number; count: number }>();
      for (const r of records) {
        const key = r.product?.category || 'Uncategorized';
        const existing = byCategory.get(key) || { sellIn: 0, sellOut: 0, value: 0, count: 0 };
        existing.sellIn += r.sellInQty;
        existing.sellOut += r.sellOutQty;
        existing.value += Number(r.sellOutValue);
        existing.count++;
        byCategory.set(key, existing);
      }
      groupedData = Array.from(byCategory.entries()).map(([key, data]) => ({
        groupKey: key,
        groupName: key,
        quantity: data.sellOut,
        value: Math.round(data.value * 100) / 100,
        recordCount: data.count,
        sellThroughRate: data.sellIn > 0 ? Math.round((data.sellOut / data.sellIn) * 100 * 100) / 100 : 0,
      }));
    } else {
      // Default: group by period
      const byPeriod = new Map<string, { sellIn: number; sellOut: number; value: number; count: number }>();
      for (const r of records) {
        const key = r.period;
        const existing = byPeriod.get(key) || { sellIn: 0, sellOut: 0, value: 0, count: 0 };
        existing.sellIn += r.sellInQty;
        existing.sellOut += r.sellOutQty;
        existing.value += Number(r.sellOutValue);
        existing.count++;
        byPeriod.set(key, existing);
      }

      const sortedPeriods = Array.from(byPeriod.entries()).sort((a, b) => a[0].localeCompare(b[0]));

      groupedData = sortedPeriods.map(([key, data], index) => {
        const prev = index > 0 ? sortedPeriods[index - 1][1] : null;
        const growthPercent = prev && prev.sellOut > 0
          ? Math.round(((data.sellOut - prev.sellOut) / prev.sellOut) * 100 * 100) / 100
          : undefined;

        return {
          groupKey: key,
          groupName: key,
          quantity: data.sellOut,
          value: Math.round(data.value * 100) / 100,
          recordCount: data.count,
          sellThroughRate: data.sellIn > 0 ? Math.round((data.sellOut / data.sellIn) * 100 * 100) / 100 : 0,
          growthPercent,
        };
      });
    }

    // Sort by value descending (except for period which is already sorted)
    if (groupBy !== 'period') {
      groupedData.sort((a, b) => b.value - a.value);
    }

    // Calculate trend (last 6 periods)
    const periods = [...new Set(records.map((r) => r.period))].sort();
    const last6Periods = periods.slice(-6);

    const trend = last6Periods.map((period) => {
      const periodRecords = records.filter((r) => r.period === period);
      const sellIn = periodRecords.reduce((sum, r) => sum + r.sellInQty, 0);
      const sellOut = periodRecords.reduce((sum, r) => sum + r.sellOutQty, 0);
      return {
        period,
        quantity: sellOut,
        value: Math.round(periodRecords.reduce((sum, r) => sum + Number(r.sellOutValue), 0) * 100) / 100,
        sellThroughRate: sellIn > 0 ? Math.round((sellOut / sellIn) * 100 * 100) / 100 : 0,
      };
    });

    // Calculate growth
    const firstPeriod = trend[0];
    const lastPeriod = trend[trend.length - 1];
    const overallGrowth = firstPeriod && lastPeriod && firstPeriod.quantity > 0
      ? Math.round(((lastPeriod.quantity - firstPeriod.quantity) / firstPeriod.quantity) * 100 * 100) / 100
      : 0;

    // Top performers
    const topProducts = [...records]
      .reduce((acc, r) => {
        const existing = acc.find((p) => p.productId === r.productId);
        if (existing) {
          existing.sellOut += r.sellOutQty;
          existing.value += Number(r.sellOutValue);
        } else {
          acc.push({
            productId: r.productId,
            productName: r.product?.name || '',
            sellOut: r.sellOutQty,
            value: Number(r.sellOutValue),
          });
        }
        return acc;
      }, [] as Array<{ productId: string; productName: string; sellOut: number; value: number }>)
      .sort((a, b) => b.sellOut - a.sellOut)
      .slice(0, 10);

    return res.status(200).json({
      data: groupedData,
      totals: {
        quantity: totals.quantity,
        value: Math.round(totals.value * 100) / 100,
      },
      trend,
      topProducts,
      analysis: {
        totalRecords: records.length,
        uniqueCustomers: new Set(records.map((r) => r.customerId)).size,
        uniqueProducts: new Set(records.map((r) => r.productId)).size,
        periodsCovered: periods.length,
        overallGrowth,
        avgSellThroughRate: Math.round(
          (records.reduce((sum, r) => {
            return sum + (r.sellInQty > 0 ? (r.sellOutQty / r.sellInQty) * 100 : 0);
          }, 0) / records.length) * 100
        ) / 100 || 0,
      },
      meta: {
        groupBy,
        filters: { customerId, productId, categoryId, periodFrom, periodTo },
      },
    });
  } catch (error) {
    console.error('Sell-out analysis error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
