import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Sell-Out Tracking API
 * GET /api/sell-tracking/sell-out - List sell-out transactions
 * POST /api/sell-tracking/sell-out - Create sell-out transaction(s)
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
    // GET - List sell-out transactions
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
        prisma.sellOut.findMany({
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
        prisma.sellOut.count({ where }),
      ]);

      const summary = await prisma.sellOut.aggregate({
        where,
        _sum: {
          quantity: true,
          totalValue: true,
        },
        _count: true,
      });

      return res.status(200).json({
        data,
        summary: {
          totalTransactions: summary._count,
          totalQuantity: summary._sum.quantity || 0,
          totalValue: summary._sum.totalValue || 0,
        },
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    }

    // POST - Create sell-out transaction(s)
    if (req.method === 'POST') {
      const body = req.body;
      const isBatch = Array.isArray(body);
      const records = isBatch ? body : [body];

      const sellOutData = records.map((record: any) => {
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
          sellingPrice: record.sellingPrice,
          totalValue: record.totalValue,
          sourceSystem: record.sourceSystem || 'MANUAL',
          sourceReference: record.sourceReference,
          periodYear: transactionDate.getFullYear(),
          periodMonth: transactionDate.getMonth() + 1,
          periodWeek: getWeekNumber(transactionDate),
          importedById: user.userId,
        };
      });

      if (isBatch) {
        const result = await prisma.sellOut.createMany({
          data: sellOutData,
          skipDuplicates: true,
        });
        return res.status(201).json({
          success: true,
          created: result.count,
          message: `${result.count} sell-out records created`,
        });
      } else {
        const result = await prisma.sellOut.create({
          data: sellOutData[0],
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
    console.error('Sell-Out API Error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate transaction code' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
