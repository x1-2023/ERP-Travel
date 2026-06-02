/**
 * Inventory API - Summary & Analytics
 * GET /api/operations/inventory/summary - Get inventory summary
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
      snapshotDateFrom,
      snapshotDateTo,
      groupBy = 'product', // product, customer, location
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;
    if (snapshotDateFrom || snapshotDateTo) {
      where.snapshotDate = {};
      if (snapshotDateFrom) (where.snapshotDate as Record<string, Date>).gte = new Date(snapshotDateFrom);
      if (snapshotDateTo) (where.snapshotDate as Record<string, Date>).lte = new Date(snapshotDateTo);
    }

    // Get latest snapshot date for each customer-product pair
    const latestSnapshots = await prisma.$queryRaw<Array<{ customerId: string; productId: string; maxDate: Date }>>`
      SELECT "customerId", "productId", MAX("snapshotDate") as "maxDate"
      FROM "InventorySnapshot"
      ${customerId ? prisma.$queryRaw`WHERE "customerId" = ${customerId}` : prisma.$queryRaw``}
      GROUP BY "customerId", "productId"
    `;

    // Get overall summary from latest snapshots
    const overallSummary = await prisma.inventorySnapshot.aggregate({
      where,
      _sum: {
        quantity: true,
        value: true,
      },
      _count: true,
      _avg: {
        quantity: true,
        value: true,
      },
    });

    // Get grouped data
    let groupedData: unknown[] = [];

    if (groupBy === 'product') {
      const rawData = await prisma.inventorySnapshot.groupBy({
        by: ['productId'],
        where,
        _sum: { quantity: true, value: true },
        _count: true,
        _avg: { quantity: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 20,
      });

      const productIds = rawData.map((r) => r.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sku: true, name: true, category: true, brand: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      groupedData = rawData.map((r) => ({
        ...r,
        product: productMap.get(r.productId),
      }));
    } else if (groupBy === 'customer') {
      const rawData = await prisma.inventorySnapshot.groupBy({
        by: ['customerId'],
        where,
        _sum: { quantity: true, value: true },
        _count: true,
        _avg: { quantity: true },
        orderBy: { _sum: { value: 'desc' } },
        take: 20,
      });

      const customerIds = rawData.map((r) => r.customerId);
      const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, code: true, name: true, channel: true },
      });
      const customerMap = new Map(customers.map((c) => [c.id, c]));

      groupedData = rawData.map((r) => ({
        ...r,
        customer: customerMap.get(r.customerId),
      }));
    } else if (groupBy === 'location') {
      groupedData = await (prisma.inventorySnapshot.groupBy as any)({
        by: ['location'],
        where,
        _sum: { quantity: true, value: true },
        _count: true,
        orderBy: { _sum: { value: 'desc' } },
      });
    }

    // Get expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await prisma.inventorySnapshot.findMany({
      where: {
        ...where,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { expiryDate: 'asc' },
      take: 10,
    });

    // Get low stock items (bottom 10 by quantity)
    const lowStockItems = await prisma.inventorySnapshot.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { quantity: 'asc' },
      take: 10,
    });

    // Get unique counts
    const [uniqueCustomers, uniqueProducts, uniqueLocations] = await Promise.all([
      prisma.inventorySnapshot.groupBy({ by: ['customerId'], where }).then((r) => r.length),
      prisma.inventorySnapshot.groupBy({ by: ['productId'], where }).then((r) => r.length),
      prisma.inventorySnapshot.groupBy({ by: ['location'], where }).then((r) => r.length),
    ]);

    return res.status(200).json({
      summary: {
        totalQuantity: overallSummary._sum.quantity || 0,
        totalValue: Number(overallSummary._sum.value || 0),
        avgQuantity: Math.round(overallSummary._avg.quantity || 0),
        avgValue: Math.round(Number(overallSummary._avg.value || 0) * 100) / 100,
        recordCount: overallSummary._count,
        uniqueCustomers,
        uniqueProducts,
        uniqueLocations,
      },
      groupedData,
      alerts: {
        expiringItems,
        expiringCount: expiringItems.length,
        lowStockItems,
        lowStockCount: lowStockItems.length,
      },
    });
  } catch (error) {
    console.error('Inventory summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
