/**
 * Sell Tracking API - Summary & Analytics
 * GET /api/operations/sell-tracking/summary - Get summary and analytics
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
      groupBy = 'period', // period, customer, product
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

    // Get overall summary
    const overallSummary = await prisma.sellTracking.aggregate({
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
    });

    // Get grouped data
    let groupedData: unknown[] = [];

    if (groupBy === 'period') {
      const rawGroupedData = await prisma.sellTracking.groupBy({
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
        orderBy: { period: 'asc' },
      });
      // Calculate sell-through rate for each period
      groupedData = rawGroupedData.map((item) => ({
        ...item,
        sellThroughRate:
          (item._sum.sellInQty || 0) > 0
            ? Math.round(((item._sum.sellOutQty || 0) / (item._sum.sellInQty || 1)) * 100 * 100) / 100
            : 0,
      }));
    } else if (groupBy === 'customer') {
      const rawData = await prisma.sellTracking.groupBy({
        by: ['customerId'],
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
        orderBy: { _sum: { sellOutValue: 'desc' } },
        take: 20,
      });

      // Enrich with customer names
      const customerIds = rawData.map((r) => r.customerId);
      const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, code: true, name: true },
      });
      const customerMap = new Map(customers.map((c) => [c.id, c]));

      groupedData = rawData.map((r) => ({
        ...r,
        customer: customerMap.get(r.customerId),
        sellThroughRate:
          (r._sum.sellInQty || 0) > 0
            ? Math.round(((r._sum.sellOutQty || 0) / (r._sum.sellInQty || 1)) * 100 * 100) / 100
            : 0,
      }));
    } else if (groupBy === 'product') {
      const rawData = await prisma.sellTracking.groupBy({
        by: ['productId'],
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
        orderBy: { _sum: { sellOutValue: 'desc' } },
        take: 20,
      });

      // Enrich with product names
      const productIds = rawData.map((r) => r.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sku: true, name: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      groupedData = rawData.map((r) => ({
        ...r,
        product: productMap.get(r.productId),
        sellThroughRate:
          (r._sum.sellInQty || 0) > 0
            ? Math.round(((r._sum.sellOutQty || 0) / (r._sum.sellInQty || 1)) * 100 * 100) / 100
            : 0,
      }));
    }

    // Calculate derived metrics
    const totalSellOutQty = overallSummary._sum.sellOutQty || 0;
    const totalStockQty = overallSummary._sum.stockQty || 0;
    const avgDailyOut = totalSellOutQty / 30;

    // Get top performers
    const topCustomers = await prisma.sellTracking.groupBy({
      by: ['customerId'],
      where,
      _sum: { sellOutValue: true, sellInQty: true, sellOutQty: true },
      orderBy: { _sum: { sellOutValue: 'desc' } },
      take: 5,
    });

    const topProducts = await prisma.sellTracking.groupBy({
      by: ['productId'],
      where,
      _sum: { sellOutValue: true, sellInQty: true, sellOutQty: true },
      orderBy: { _sum: { sellOutValue: 'desc' } },
      take: 5,
    });

    // Enrich top performers
    const topCustomerIds = topCustomers.map((t) => t.customerId);
    const topProductIds = topProducts.map((t) => t.productId);

    const [topCustomerDetails, topProductDetails] = await Promise.all([
      prisma.customer.findMany({
        where: { id: { in: topCustomerIds } },
        select: { id: true, code: true, name: true },
      }),
      prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, sku: true, name: true },
      }),
    ]);

    const customerMap = new Map(topCustomerDetails.map((c) => [c.id, c]));
    const productMap = new Map(topProductDetails.map((p) => [p.id, p]));

    // Calculate overall sell-through rate
    const totalSellInQty = overallSummary._sum.sellInQty || 0;
    const overallSellThroughRate = totalSellInQty > 0
      ? Math.round((totalSellOutQty / totalSellInQty) * 100 * 100) / 100
      : 0;

    return res.status(200).json({
      summary: {
        totalSellIn: overallSummary._sum.sellInValue || 0,
        totalSellOut: overallSummary._sum.sellOutValue || 0,
        totalStock: overallSummary._sum.stockValue || 0,
        sellThroughRate: overallSellThroughRate,
        avgDaysOfStock: avgDailyOut > 0 ? Math.round(totalStockQty / avgDailyOut) : 0,
        recordCount: overallSummary._count,
        uniqueCustomers: await prisma.sellTracking.groupBy({
          by: ['customerId'],
          where,
          _count: true,
        }).then((r) => r.length),
        uniqueProducts: await prisma.sellTracking.groupBy({
          by: ['productId'],
          where,
          _count: true,
        }).then((r) => r.length),
      },
      groupedData,
      topPerformers: {
        customers: topCustomers.map((t) => {
          const sellInQty = t._sum.sellInQty || 0;
          const sellOutQty = t._sum.sellOutQty || 0;
          const sellThroughRate = sellInQty > 0
            ? Math.round((sellOutQty / sellInQty) * 100 * 100) / 100
            : 0;
          return {
            customer: customerMap.get(t.customerId),
            sellOutValue: t._sum.sellOutValue || 0,
            sellThroughRate,
          };
        }),
        products: topProducts.map((t) => {
          const sellInQty = t._sum.sellInQty || 0;
          const sellOutQty = t._sum.sellOutQty || 0;
          const sellThroughRate = sellInQty > 0
            ? Math.round((sellOutQty / sellInQty) * 100 * 100) / 100
            : 0;
          return {
            product: productMap.get(t.productId),
            sellOutValue: t._sum.sellOutValue || 0,
            sellThroughRate,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Sell tracking summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
