/**
 * Inventory API - History & Trends
 * GET /api/operations/inventory/history - Get inventory history and trends
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
      days = '90',
    } = req.query as Record<string, string>;

    if (!customerId && !productId) {
      return res.status(400).json({
        error: 'At least one of customerId or productId is required',
      });
    }

    const daysNum = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Build where clause
    const where: Record<string, unknown> = {
      snapshotDate: { gte: startDate },
    };
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;

    // Get historical snapshots
    const snapshots = await prisma.inventorySnapshot.findMany({
      where,
      orderBy: { snapshotDate: 'asc' },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    // Group by date for trend analysis
    const dailyTotals: Record<string, { quantity: number; value: number; count: number }> = {};

    for (const snapshot of snapshots) {
      const dateStr = snapshot.snapshotDate.toISOString().split('T')[0];
      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = { quantity: 0, value: 0, count: 0 };
      }
      dailyTotals[dateStr].quantity += snapshot.quantity;
      dailyTotals[dateStr].value += Number(snapshot.value);
      dailyTotals[dateStr].count++;
    }

    const timeline = Object.entries(dailyTotals)
      .map(([date, data]) => ({
        date,
        totalQuantity: data.quantity,
        totalValue: Math.round(data.value * 100) / 100,
        snapshotCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate period-over-period changes
    const changes = timeline.map((point, index) => {
      if (index === 0) {
        return { date: point.date, quantityChange: null, valueChange: null };
      }
      const prev = timeline[index - 1];
      return {
        date: point.date,
        quantityChange: prev.totalQuantity > 0
          ? Math.round(((point.totalQuantity - prev.totalQuantity) / prev.totalQuantity) * 100)
          : null,
        valueChange: prev.totalValue > 0
          ? Math.round(((point.totalValue - prev.totalValue) / prev.totalValue) * 100)
          : null,
      };
    });

    // Calculate overall trends
    const firstPoint = timeline[0];
    const lastPoint = timeline[timeline.length - 1];

    const overallTrend = timeline.length > 1
      ? {
          quantityGrowth: firstPoint.totalQuantity > 0
            ? Math.round(((lastPoint.totalQuantity - firstPoint.totalQuantity) / firstPoint.totalQuantity) * 100)
            : 0,
          valueGrowth: firstPoint.totalValue > 0
            ? Math.round(((lastPoint.totalValue - firstPoint.totalValue) / firstPoint.totalValue) * 100)
            : 0,
          avgDailyQuantity: Math.round(
            timeline.reduce((sum, p) => sum + p.totalQuantity, 0) / timeline.length
          ),
          avgDailyValue: Math.round(
            (timeline.reduce((sum, p) => sum + p.totalValue, 0) / timeline.length) * 100
          ) / 100,
        }
      : null;

    // Calculate 7-day moving average
    const movingAverages = timeline.map((point, index) => {
      if (index < 6) return { date: point.date, ma7Quantity: null, ma7Value: null };

      const slice = timeline.slice(index - 6, index + 1);
      return {
        date: point.date,
        ma7Quantity: Math.round(slice.reduce((sum, p) => sum + p.totalQuantity, 0) / 7),
        ma7Value: Math.round((slice.reduce((sum, p) => sum + p.totalValue, 0) / 7) * 100) / 100,
      };
    });

    // Get current inventory status
    const latestDate = snapshots.length > 0
      ? snapshots[snapshots.length - 1].snapshotDate
      : new Date();

    const currentInventory = await prisma.inventorySnapshot.aggregate({
      where: {
        ...where,
        snapshotDate: latestDate,
      },
      _sum: { quantity: true, value: true },
      _count: true,
    });

    return res.status(200).json({
      timeline,
      changes,
      movingAverages,
      overallTrend,
      currentStatus: {
        date: latestDate.toISOString().split('T')[0],
        totalQuantity: currentInventory._sum.quantity || 0,
        totalValue: Number(currentInventory._sum.value || 0),
        snapshotCount: currentInventory._count,
      },
      meta: {
        daysAnalyzed: daysNum,
        dataPoints: timeline.length,
        filters: { customerId, productId },
      },
    });
  } catch (error) {
    console.error('Inventory history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
