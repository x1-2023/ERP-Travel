import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Promotion Deliveries API
 * GET /api/delivery-profiles/deliveries - List promotion deliveries
 * POST /api/delivery-profiles/deliveries - Create promotion delivery
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
    // GET - List promotion deliveries
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        promotionId,
        profileId,
        status,
        startDate,
        endDate,
        priority,
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: any = {
        companyId: user.companyId,
      };

      if (promotionId) where.promotionId = promotionId;
      if (profileId) where.profileId = profileId;
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (startDate || endDate) {
        where.plannedDate = {};
        if (startDate) where.plannedDate.gte = new Date(startDate);
        if (endDate) where.plannedDate.lte = new Date(endDate);
      }

      const [data, total] = await Promise.all([
        prisma.promotionDelivery.findMany({
          where,
          skip,
          take,
          orderBy: { plannedDate: 'asc' },
          include: {
            promotion: { select: { id: true, code: true, name: true, status: true } },
            profile: {
              include: {
                customer: { select: { id: true, code: true, name: true } },
              },
            },
          },
        }),
        prisma.promotionDelivery.count({ where }),
      ]);

      // Summary by status
      const statusSummary = await prisma.promotionDelivery.groupBy({
        by: ['status'],
        where: { companyId: user.companyId },
        _count: true,
        _sum: {
          plannedUnits: true,
          actualUnits: true,
          plannedValue: true,
          actualValue: true,
        },
      });

      return res.status(200).json({
        data,
        summary: statusSummary,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    }

    // POST - Create promotion delivery
    if (req.method === 'POST') {
      const body = req.body;
      const isBatch = Array.isArray(body);
      const records = isBatch ? body : [body];

      const deliveries = [];
      for (const record of records) {
        // Validate promotion and profile
        const [promotion, profile] = await Promise.all([
          prisma.promotion.findFirst({
            where: { id: record.promotionId, customer: { companyId: user.companyId } },
          }),
          prisma.deliveryProfile.findFirst({
            where: { id: record.profileId, companyId: user.companyId },
          }),
        ]);

        if (!promotion) {
          return res.status(404).json({ error: `Promotion not found: ${record.promotionId}` });
        }
        if (!profile) {
          return res.status(404).json({ error: `Delivery profile not found: ${record.profileId}` });
        }

        const delivery = await prisma.promotionDelivery.create({
          data: {
            companyId: user.companyId,
            promotionId: record.promotionId,
            profileId: record.profileId,
            plannedDate: new Date(record.plannedDate),
            plannedUnits: record.plannedUnits,
            plannedValue: record.plannedValue,
            priority: record.priority || 'NORMAL',
            deliveryNote: record.deliveryNote,
          },
          include: {
            promotion: { select: { id: true, code: true, name: true } },
            profile: {
              include: {
                customer: { select: { id: true, code: true, name: true } },
              },
            },
          },
        });
        deliveries.push(delivery);
      }

      if (isBatch) {
        return res.status(201).json({
          success: true,
          count: deliveries.length,
          data: deliveries,
        });
      } else {
        return res.status(201).json({ data: deliveries[0] });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Promotion Deliveries API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
