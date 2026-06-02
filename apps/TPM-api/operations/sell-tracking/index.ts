/**
 * Sell Tracking API - List & Create
 * GET /api/operations/sell-tracking - List sell tracking records
 * POST /api/operations/sell-tracking - Create a new record
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      return handleList(req, res);
    }

    if (req.method === 'POST') {
      return handleCreate(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sell tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    customerId,
    productId,
    period,
    periodFrom,
    periodTo,
    search,
    sortBy = 'period',
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where: Record<string, unknown> = {};

  if (customerId) where.customerId = customerId;
  if (productId) where.productId = productId;
  if (period) where.period = period;

  if (periodFrom || periodTo) {
    where.period = {};
    if (periodFrom) (where.period as Record<string, string>).gte = periodFrom;
    if (periodTo) (where.period as Record<string, string>).lte = periodTo;
  }

  if (search) {
    where.OR = [
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { code: { contains: search, mode: 'insensitive' } } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
      { product: { sku: { contains: search, mode: 'insensitive' } } },
      { product: { sku: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Build orderBy
  const orderBy: Record<string, string> = {};
  orderBy[sortBy] = sortOrder;

  const [rawTracking, total, summaryData] = await Promise.all([
    prisma.sellTracking.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
    }),
    prisma.sellTracking.count({ where }),
    prisma.sellTracking.aggregate({
      where,
      _sum: {
        sellInQty: true,
        sellInValue: true,
        sellOutQty: true,
        sellOutValue: true,
        stockQty: true,
        stockValue: true,
      },
    }),
  ]);

  // Add calculated sell-through rate to each record
  const tracking = rawTracking.map((record) => ({
    ...record,
    sellThroughRate: record.sellInQty > 0
      ? Math.round((record.sellOutQty / record.sellInQty) * 100 * 100) / 100
      : 0,
  }));

  // Calculate summary
  const totalSellInQty = summaryData._sum.sellInQty || 0;
  const totalSellOutQty = summaryData._sum.sellOutQty || 0;
  const totalStockQty = summaryData._sum.stockQty || 0;
  const avgDailyOut = totalSellOutQty / 30; // Assuming 30-day month

  // Calculate overall sell-through rate
  const overallSellThroughRate = totalSellInQty > 0
    ? Math.round((totalSellOutQty / totalSellInQty) * 100 * 100) / 100
    : 0;

  const summary = {
    totalSellIn: summaryData._sum.sellInValue || 0,
    totalSellOut: summaryData._sum.sellOutValue || 0,
    totalStock: summaryData._sum.stockValue || 0,
    sellThroughRate: overallSellThroughRate,
    avgDaysOfStock: avgDailyOut > 0 ? Math.round(totalStockQty / avgDailyOut) : 0,
    recordCount: total,
  };

  return res.status(200).json({
    data: tracking,
    summary,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const {
    customerId,
    productId,
    period,
    sellInQty,
    sellInValue,
    sellOutQty,
    sellOutValue,
    stockQty,
    stockValue,
  } = req.body;

  // Validation
  if (!customerId || !productId || !period) {
    return res.status(400).json({
      error: 'Missing required fields: customerId, productId, period',
    });
  }

  // Validate period format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({
      error: 'Period must be in YYYY-MM format',
    });
  }

  // Parse numeric values
  const parsedSellInQty = sellInQty !== undefined ? parseInt(sellInQty) : 0;
  const parsedSellInValue = sellInValue !== undefined ? parseFloat(sellInValue) : 0;
  const parsedSellOutQty = sellOutQty !== undefined ? parseInt(sellOutQty) : 0;
  const parsedSellOutValue = sellOutValue !== undefined ? parseFloat(sellOutValue) : 0;
  const parsedStockQty = stockQty !== undefined ? parseInt(stockQty) : 0;
  const parsedStockValue = stockValue !== undefined ? parseFloat(stockValue) : 0;

  // Upsert: create or update if exists
  const tracking = await prisma.sellTracking.upsert({
    where: {
      customerId_productId_period: { customerId, productId, period },
    },
    update: {
      sellInQty: parsedSellInQty,
      sellInValue: parsedSellInValue,
      sellOutQty: parsedSellOutQty,
      sellOutValue: parsedSellOutValue,
      stockQty: parsedStockQty,
      stockValue: parsedStockValue,
    },
    create: {
      customerId,
      productId,
      period,
      sellInQty: parsedSellInQty,
      sellInValue: parsedSellInValue,
      sellOutQty: parsedSellOutQty,
      sellOutValue: parsedSellOutValue,
      stockQty: parsedStockQty,
      stockValue: parsedStockValue,
    },
    include: {
      customer: { select: { id: true, code: true, name: true } },
      product: { select: { id: true, sku: true, name: true } },
    },
  });

  // Calculate sell-through rate for response
  const sellThroughRate = parsedSellInQty > 0
    ? Math.round((parsedSellOutQty / parsedSellInQty) * 100 * 100) / 100
    : 0;

  return res.status(200).json({
    data: {
      ...tracking,
      sellThroughRate,
    },
  });
}
