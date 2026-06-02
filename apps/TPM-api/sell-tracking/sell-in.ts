import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Sell-In Tracking API
 * GET /api/sell-tracking/sell-in - List sell-in transactions
 * POST /api/sell-tracking/sell-in - Create sell-in transaction(s)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Auth check
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET - List sell-in transactions
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        customerId,
        productId,
        promotionId,
        startDate,
        endDate,
        periodYear,
        periodMonth,
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where: any = {
        companyId: user.companyId,
      };

      if (customerId) where.customerId = customerId;
      if (productId) where.productId = productId;
      if (promotionId) where.promotionId = promotionId;
      if (periodYear) where.periodYear = parseInt(periodYear);
      if (periodMonth) where.periodMonth = parseInt(periodMonth);
      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate.gte = new Date(startDate);
        if (endDate) where.transactionDate.lte = new Date(endDate);
      }

      const [data, total] = await Promise.all([
        prisma.sellIn.findMany({
          where,
          skip,
          take,
          orderBy: { transactionDate: 'desc' },
          include: {
            customer: { select: { id: true, code: true, name: true } },
            product: { select: { id: true, sku: true, name: true } },
            promotion: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.sellIn.count({ where }),
      ]);

      // Aggregate summary
      const summary = await prisma.sellIn.aggregate({
        where,
        _sum: {
          quantity: true,
          grossValue: true,
          discountValue: true,
          netValue: true,
        },
        _count: true,
      });

      return res.status(200).json({
        data,
        summary: {
          totalTransactions: summary._count,
          totalQuantity: summary._sum.quantity || 0,
          totalGrossValue: summary._sum.grossValue || 0,
          totalDiscountValue: summary._sum.discountValue || 0,
          totalNetValue: summary._sum.netValue || 0,
        },
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    }

    // POST - Create sell-in transaction(s)
    if (req.method === 'POST') {
      const body = req.body;
      const isBatch = Array.isArray(body);
      const records = isBatch ? body : [body];

      // Validate and prepare records
      const sellInData = records.map((record: any) => {
        const transactionDate = new Date(record.transactionDate);
        return {
          companyId: user.companyId,
          transactionCode: record.transactionCode,
          transactionDate,
          promotionId: record.promotionId || null,
          customerId: record.customerId,
          channelId: record.channelId || null,
          regionId: record.regionId || null,
          productId: record.productId,
          quantity: record.quantity,
          quantityCase: record.quantityCase,
          grossValue: record.grossValue,
          discountValue: record.discountValue || 0,
          netValue: record.netValue,
          sourceSystem: record.sourceSystem || 'MANUAL',
          sourceReference: record.sourceReference,
          periodYear: transactionDate.getFullYear(),
          periodMonth: transactionDate.getMonth() + 1,
          periodWeek: getWeekNumber(transactionDate),
          importedById: user.userId,
        };
      });

      // Create records
      if (isBatch) {
        const result = await prisma.sellIn.createMany({
          data: sellInData,
          skipDuplicates: true,
        });
        return res.status(201).json({
          success: true,
          created: result.count,
          message: `${result.count} sell-in records created`,
        });
      } else {
        const result = await prisma.sellIn.create({
          data: sellInData[0],
          include: {
            customer: { select: { id: true, code: true, name: true } },
            product: { select: { id: true, sku: true, name: true } },
          },
        });
        return res.status(201).json({ data: result });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Sell-In API Error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate transaction code' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Helper: Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
