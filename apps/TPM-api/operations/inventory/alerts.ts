/**
 * Inventory API - Alerts
 * GET /api/operations/inventory/alerts - Get inventory alerts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface InventoryAlert {
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'NEAR_EXPIRY' | 'EXPIRED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  currentQty: number;
  threshold: number;
  message: string;
  expiryDate?: string;
  snapshotDate: string;
  location?: string;
}

// Thresholds
const THRESHOLDS = {
  LOW_STOCK_COVERAGE_MONTHS: 1, // Less than 1 month coverage = low stock
  OVERSTOCK_COVERAGE_MONTHS: 6, // More than 6 months coverage = overstock
  NEAR_EXPIRY_DAYS: 30, // Less than 30 days to expiry
  CRITICAL_EXPIRY_DAYS: 7, // Less than 7 days to expiry
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
      type,
    } = req.query as Record<string, string>;

    // Get the latest snapshot date
    const latestSnapshot = await prisma.inventorySnapshot.findFirst({
      orderBy: { snapshotDate: 'desc' },
      select: { snapshotDate: true },
    });

    if (!latestSnapshot) {
      return res.status(200).json({
        data: [],
        summary: { total: 0, critical: 0, warning: 0, info: 0 },
      });
    }

    // Build where clause for latest snapshots
    const where: Record<string, unknown> = {
      snapshotDate: latestSnapshot.snapshotDate,
    };
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;

    // Fetch latest snapshots
    const snapshots = await prisma.inventorySnapshot.findMany({
      where,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    // Get sell tracking data for stock coverage calculation
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const sellData = await prisma.sellTracking.findMany({
      where: {
        period: { gte: `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}` },
      },
      select: {
        customerId: true,
        productId: true,
        sellOutQty: true,
      },
    });

    // Calculate average monthly sell-out by customer-product
    const sellOutMap = new Map<string, number>();
    const sellOutCounts = new Map<string, number>();
    for (const s of sellData) {
      const key = `${s.customerId}-${s.productId}`;
      sellOutMap.set(key, (sellOutMap.get(key) || 0) + s.sellOutQty);
      sellOutCounts.set(key, (sellOutCounts.get(key) || 0) + 1);
    }

    const avgMonthlySellOut = new Map<string, number>();
    for (const [key, total] of sellOutMap) {
      const count = sellOutCounts.get(key) || 1;
      avgMonthlySellOut.set(key, total / count);
    }

    const alerts: InventoryAlert[] = [];

    for (const snapshot of snapshots) {
      const customer = snapshot.customer;
      const product = snapshot.product;
      const key = `${snapshot.customerId}-${snapshot.productId}`;
      const avgSellOut = avgMonthlySellOut.get(key) || 0;

      // 1. Out of Stock Alert
      if (snapshot.quantity === 0) {
        alerts.push({
          type: 'OUT_OF_STOCK',
          severity: 'CRITICAL',
          customerId: snapshot.customerId,
          customerName: customer?.name || '',
          productId: snapshot.productId,
          productName: product?.name || '',
          currentQty: 0,
          threshold: 0,
          message: 'Product is out of stock',
          snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
          location: snapshot.location || undefined,
        });
        continue; // Skip other checks for out of stock items
      }

      // 2. Low Stock Alert (less than 1 month coverage)
      if (avgSellOut > 0) {
        const monthsCoverage = snapshot.quantity / avgSellOut;
        if (monthsCoverage < THRESHOLDS.LOW_STOCK_COVERAGE_MONTHS) {
          alerts.push({
            type: 'LOW_STOCK',
            severity: monthsCoverage < 0.5 ? 'CRITICAL' : 'WARNING',
            customerId: snapshot.customerId,
            customerName: customer?.name || '',
            productId: snapshot.productId,
            productName: product?.name || '',
            currentQty: snapshot.quantity,
            threshold: Math.round(avgSellOut * THRESHOLDS.LOW_STOCK_COVERAGE_MONTHS),
            message: `Low stock: ${Math.round(monthsCoverage * 30)} days of coverage remaining`,
            snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
            location: snapshot.location || undefined,
          });
        }

        // 3. Overstock Alert (more than 6 months coverage)
        if (monthsCoverage > THRESHOLDS.OVERSTOCK_COVERAGE_MONTHS) {
          alerts.push({
            type: 'OVERSTOCK',
            severity: monthsCoverage > 12 ? 'WARNING' : 'INFO',
            customerId: snapshot.customerId,
            customerName: customer?.name || '',
            productId: snapshot.productId,
            productName: product?.name || '',
            currentQty: snapshot.quantity,
            threshold: Math.round(avgSellOut * THRESHOLDS.OVERSTOCK_COVERAGE_MONTHS),
            message: `Overstock: ${Math.round(monthsCoverage)} months of coverage`,
            snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
            location: snapshot.location || undefined,
          });
        }
      }

      // 4. Expiry Alerts
      if (snapshot.expiryDate) {
        const daysToExpiry = Math.floor(
          (snapshot.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysToExpiry <= 0) {
          alerts.push({
            type: 'EXPIRED',
            severity: 'CRITICAL',
            customerId: snapshot.customerId,
            customerName: customer?.name || '',
            productId: snapshot.productId,
            productName: product?.name || '',
            currentQty: snapshot.quantity,
            threshold: 0,
            message: `Product expired ${Math.abs(daysToExpiry)} days ago`,
            expiryDate: snapshot.expiryDate.toISOString().split('T')[0],
            snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
            location: snapshot.location || undefined,
          });
        } else if (daysToExpiry <= THRESHOLDS.CRITICAL_EXPIRY_DAYS) {
          alerts.push({
            type: 'NEAR_EXPIRY',
            severity: 'CRITICAL',
            customerId: snapshot.customerId,
            customerName: customer?.name || '',
            productId: snapshot.productId,
            productName: product?.name || '',
            currentQty: snapshot.quantity,
            threshold: THRESHOLDS.CRITICAL_EXPIRY_DAYS,
            message: `Expires in ${daysToExpiry} days`,
            expiryDate: snapshot.expiryDate.toISOString().split('T')[0],
            snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
            location: snapshot.location || undefined,
          });
        } else if (daysToExpiry <= THRESHOLDS.NEAR_EXPIRY_DAYS) {
          alerts.push({
            type: 'NEAR_EXPIRY',
            severity: 'WARNING',
            customerId: snapshot.customerId,
            customerName: customer?.name || '',
            productId: snapshot.productId,
            productName: product?.name || '',
            currentQty: snapshot.quantity,
            threshold: THRESHOLDS.NEAR_EXPIRY_DAYS,
            message: `Expires in ${daysToExpiry} days`,
            expiryDate: snapshot.expiryDate.toISOString().split('T')[0],
            snapshotDate: snapshot.snapshotDate.toISOString().split('T')[0],
            location: snapshot.location || undefined,
          });
        }
      }
    }

    // Filter by severity and type if specified
    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = filteredAlerts.filter((a) => a.severity === severity.toUpperCase());
    }
    if (type) {
      filteredAlerts = filteredAlerts.filter((a) => a.type === type.toUpperCase());
    }

    // Sort by severity (CRITICAL first)
    filteredAlerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Summary
    const summary = {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter((a) => a.severity === 'CRITICAL').length,
      warning: filteredAlerts.filter((a) => a.severity === 'WARNING').length,
      info: filteredAlerts.filter((a) => a.severity === 'INFO').length,
      byType: {
        OUT_OF_STOCK: filteredAlerts.filter((a) => a.type === 'OUT_OF_STOCK').length,
        LOW_STOCK: filteredAlerts.filter((a) => a.type === 'LOW_STOCK').length,
        OVERSTOCK: filteredAlerts.filter((a) => a.type === 'OVERSTOCK').length,
        NEAR_EXPIRY: filteredAlerts.filter((a) => a.type === 'NEAR_EXPIRY').length,
        EXPIRED: filteredAlerts.filter((a) => a.type === 'EXPIRED').length,
      },
    };

    return res.status(200).json({
      data: filteredAlerts,
      summary,
      thresholds: THRESHOLDS,
      meta: {
        snapshotDate: latestSnapshot.snapshotDate.toISOString().split('T')[0],
        filters: { customerId, productId, severity, type },
      },
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
