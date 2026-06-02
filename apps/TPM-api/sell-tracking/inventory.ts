import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Customer Inventory API
 * GET /api/sell-tracking/inventory - List inventory snapshots
 * POST /api/sell-tracking/inventory - Create/update inventory snapshot
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET - List inventory snapshots
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        customerId,
        productId,
        snapshotDate,
        periodYear,
        periodMonth,
        lowStock, // filter for low stock items (daysOfStock < threshold)
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: any = {
        companyId: user.companyId,
      };

      if (customerId) where.customerId = customerId;
      if (productId) where.productId = productId;
      if (snapshotDate) where.snapshotDate = new Date(snapshotDate);
      if (periodYear) where.periodYear = parseInt(periodYear);
      if (periodMonth) where.periodMonth = parseInt(periodMonth);
      if (lowStock) {
        where.daysOfStock = { lt: parseInt(lowStock) };
      }

      const [data, total] = await Promise.all([
        prisma.customerInventory.findMany({
          where,
          skip,
          take,
          orderBy: [{ snapshotDate: 'desc' }, { customerId: 'asc' }],
          include: {
            customer: { select: { id: true, code: true, name: true } },
            product: { select: { id: true, sku: true, name: true, price: true } },
          },
        }),
        prisma.customerInventory.count({ where }),
      ]);

      // Summary aggregations
      const summary = await prisma.customerInventory.aggregate({
        where,
        _sum: {
          openingStock: true,
          receivedQty: true,
          soldQty: true,
          closingStock: true,
          stockValue: true,
        },
        _avg: {
          daysOfStock: true,
          avgDailySales: true,
        },
      });

      return res.status(200).json({
        data,
        summary: {
          totalOpeningStock: summary._sum.openingStock || 0,
          totalReceivedQty: summary._sum.receivedQty || 0,
          totalSoldQty: summary._sum.soldQty || 0,
          totalClosingStock: summary._sum.closingStock || 0,
          totalStockValue: summary._sum.stockValue || 0,
          avgDaysOfStock: summary._avg.daysOfStock || 0,
          avgDailySales: summary._avg.avgDailySales || 0,
        },
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    }

    // POST - Create/update inventory snapshot
    if (req.method === 'POST') {
      const body = req.body;
      const isBatch = Array.isArray(body);
      const records = isBatch ? body : [body];

      const results = [];
      for (const record of records) {
        const snapshotDate = new Date(record.snapshotDate);

        // Calculate derived fields
        const closingStock =
          (record.openingStock || 0) +
          (record.receivedQty || 0) -
          (record.soldQty || 0) +
          (record.adjustments || 0);

        const avgDailySales = record.avgDailySales || (record.soldQty ? record.soldQty / 30 : 0);
        const daysOfStock = avgDailySales > 0 ? Math.round(closingStock / avgDailySales) : null;

        // Upsert (create or update)
        const result = await prisma.customerInventory.upsert({
          where: {
            companyId_customerId_productId_snapshotDate: {
              companyId: user.companyId,
              customerId: record.customerId,
              productId: record.productId,
              snapshotDate,
            },
          },
          create: {
            companyId: user.companyId,
            snapshotDate,
            customerId: record.customerId,
            productId: record.productId,
            openingStock: record.openingStock || 0,
            receivedQty: record.receivedQty || 0,
            soldQty: record.soldQty || 0,
            adjustments: record.adjustments || 0,
            closingStock,
            avgDailySales,
            daysOfStock,
            stockValue: record.stockValue,
            periodYear: snapshotDate.getFullYear(),
            periodMonth: snapshotDate.getMonth() + 1,
            periodWeek: record.periodWeek,
            sourceSystem: record.sourceSystem || 'MANUAL',
          },
          update: {
            openingStock: record.openingStock || 0,
            receivedQty: record.receivedQty || 0,
            soldQty: record.soldQty || 0,
            adjustments: record.adjustments || 0,
            closingStock,
            avgDailySales,
            daysOfStock,
            stockValue: record.stockValue,
            sourceSystem: record.sourceSystem,
          },
          include: {
            customer: { select: { id: true, code: true, name: true } },
            product: { select: { id: true, sku: true, name: true } },
          },
        });
        results.push(result);
      }

      if (isBatch) {
        return res.status(201).json({
          success: true,
          count: results.length,
          data: results,
        });
      } else {
        return res.status(201).json({ data: results[0] });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Inventory API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
