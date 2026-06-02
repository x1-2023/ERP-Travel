/**
 * Sell Tracking API - Alerts
 * GET /api/operations/sell-tracking/alerts - Get sell tracking alerts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface SellAlert {
  type: 'LOW_SELL_THROUGH' | 'HIGH_STOCK' | 'NEGATIVE_TREND' | 'STOCKOUT_RISK';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  message: string;
  metric: number;
  threshold: number;
  period: string;
}

// Thresholds
const THRESHOLDS = {
  LOW_SELL_THROUGH_WARNING: 50,
  LOW_SELL_THROUGH_CRITICAL: 30,
  HIGH_STOCK_DAYS_WARNING: 60,
  HIGH_STOCK_DAYS_CRITICAL: 90,
  STOCKOUT_RISK_DAYS: 7,
};

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
      severity,
    } = req.query as Record<string, string>;

    // Get current period (current month)
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get last 3 periods for trend analysis
    const periods: string[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    // Build where clause
    const where: Record<string, unknown> = {
      period: { in: periods },
    };
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;

    // Fetch data
    const records = await prisma.sellTracking.findMany({
      where,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
      orderBy: { period: 'desc' },
    });

    const alerts: SellAlert[] = [];

    // Group by customer-product for analysis
    const grouped = new Map<string, typeof records>();
    for (const r of records) {
      const key = `${r.customerId}-${r.productId}`;
      const existing = grouped.get(key) || [];
      existing.push(r);
      grouped.set(key, existing);
    }

    for (const [, group] of grouped) {
      const latestRecord = group[0]; // Most recent period
      const customer = latestRecord.customer;
      const product = latestRecord.product;

      // 1. Low Sell-Through Rate Alert
      if (latestRecord.sellInQty > 0) {
        const sellThroughRate = (latestRecord.sellOutQty / latestRecord.sellInQty) * 100;

        if (sellThroughRate < THRESHOLDS.LOW_SELL_THROUGH_CRITICAL) {
          alerts.push({
            type: 'LOW_SELL_THROUGH',
            severity: 'CRITICAL',
            customerId: latestRecord.customerId,
            customerName: customer?.name || '',
            productId: latestRecord.productId,
            productName: product?.name || '',
            message: `Sell-through rate is critically low at ${sellThroughRate.toFixed(1)}%`,
            metric: Math.round(sellThroughRate * 100) / 100,
            threshold: THRESHOLDS.LOW_SELL_THROUGH_CRITICAL,
            period: latestRecord.period,
          });
        } else if (sellThroughRate < THRESHOLDS.LOW_SELL_THROUGH_WARNING) {
          alerts.push({
            type: 'LOW_SELL_THROUGH',
            severity: 'WARNING',
            customerId: latestRecord.customerId,
            customerName: customer?.name || '',
            productId: latestRecord.productId,
            productName: product?.name || '',
            message: `Sell-through rate is low at ${sellThroughRate.toFixed(1)}%`,
            metric: Math.round(sellThroughRate * 100) / 100,
            threshold: THRESHOLDS.LOW_SELL_THROUGH_WARNING,
            period: latestRecord.period,
          });
        }
      }

      // 2. High Stock Alert (Days of Supply)
      if (latestRecord.stockQty > 0 && latestRecord.sellOutQty > 0) {
        const dailySellOut = latestRecord.sellOutQty / 30;
        const daysOfStock = latestRecord.stockQty / dailySellOut;

        if (daysOfStock > THRESHOLDS.HIGH_STOCK_DAYS_CRITICAL) {
          alerts.push({
            type: 'HIGH_STOCK',
            severity: 'CRITICAL',
            customerId: latestRecord.customerId,
            customerName: customer?.name || '',
            productId: latestRecord.productId,
            productName: product?.name || '',
            message: `Extremely high stock: ${Math.round(daysOfStock)} days of supply`,
            metric: Math.round(daysOfStock),
            threshold: THRESHOLDS.HIGH_STOCK_DAYS_CRITICAL,
            period: latestRecord.period,
          });
        } else if (daysOfStock > THRESHOLDS.HIGH_STOCK_DAYS_WARNING) {
          alerts.push({
            type: 'HIGH_STOCK',
            severity: 'WARNING',
            customerId: latestRecord.customerId,
            customerName: customer?.name || '',
            productId: latestRecord.productId,
            productName: product?.name || '',
            message: `High stock: ${Math.round(daysOfStock)} days of supply`,
            metric: Math.round(daysOfStock),
            threshold: THRESHOLDS.HIGH_STOCK_DAYS_WARNING,
            period: latestRecord.period,
          });
        }
      }

      // 3. Stockout Risk Alert
      if (latestRecord.stockQty > 0 && latestRecord.sellOutQty > 0) {
        const dailySellOut = latestRecord.sellOutQty / 30;
        const daysOfStock = latestRecord.stockQty / dailySellOut;

        if (daysOfStock < THRESHOLDS.STOCKOUT_RISK_DAYS) {
          alerts.push({
            type: 'STOCKOUT_RISK',
            severity: 'CRITICAL',
            customerId: latestRecord.customerId,
            customerName: customer?.name || '',
            productId: latestRecord.productId,
            productName: product?.name || '',
            message: `Stockout risk: Only ${Math.round(daysOfStock)} days of supply remaining`,
            metric: Math.round(daysOfStock),
            threshold: THRESHOLDS.STOCKOUT_RISK_DAYS,
            period: latestRecord.period,
          });
        }
      }

      // 4. Negative Trend Alert (comparing periods)
      if (group.length >= 2) {
        const current = group[0];
        const previous = group[1];

        if (previous.sellOutQty > 0) {
          const growthRate = ((current.sellOutQty - previous.sellOutQty) / previous.sellOutQty) * 100;

          if (growthRate < -20) {
            alerts.push({
              type: 'NEGATIVE_TREND',
              severity: growthRate < -40 ? 'CRITICAL' : 'WARNING',
              customerId: current.customerId,
              customerName: customer?.name || '',
              productId: current.productId,
              productName: product?.name || '',
              message: `Sell-out declined by ${Math.abs(Math.round(growthRate))}% vs previous period`,
              metric: Math.round(growthRate),
              threshold: -20,
              period: current.period,
            });
          }
        }
      }
    }

    // Filter by severity if specified
    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = alerts.filter((a) => a.severity === severity.toUpperCase());
    }

    // Sort by severity (CRITICAL first) then by metric
    filteredAlerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      const diff = severityOrder[a.severity] - severityOrder[b.severity];
      if (diff !== 0) return diff;
      return a.metric - b.metric;
    });

    // Summary
    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter((a) => a.severity === 'CRITICAL').length,
      warning: filteredAlerts.filter((a) => a.severity === 'WARNING').length,
      info: filteredAlerts.filter((a) => a.severity === 'INFO').length,
      byType: {
        LOW_SELL_THROUGH: filteredAlerts.filter((a) => a.type === 'LOW_SELL_THROUGH').length,
        HIGH_STOCK: filteredAlerts.filter((a) => a.type === 'HIGH_STOCK').length,
        STOCKOUT_RISK: filteredAlerts.filter((a) => a.type === 'STOCKOUT_RISK').length,
        NEGATIVE_TREND: filteredAlerts.filter((a) => a.type === 'NEGATIVE_TREND').length,
      },
    };

    return res.status(200).json({
      data: filteredAlerts,
      summary,
      thresholds: THRESHOLDS,
      meta: {
        currentPeriod,
        periodsAnalyzed: periods,
        filters: { customerId, productId, severity },
      },
    });
  } catch (error) {
    console.error('Sell tracking alerts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
