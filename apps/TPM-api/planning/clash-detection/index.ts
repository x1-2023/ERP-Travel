import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
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
      const { page = '1', limit = '20', severity, promotionId, resolved } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {};
      if (severity) where.severity = severity;
      if (promotionId) {
        where.OR = [{ promotionAId: promotionId }, { promotionBId: promotionId }];
      }
      if (resolved !== undefined) {
        where.resolvedAt = resolved === 'true' ? { not: null } : null;
      }

      const [clashes, total] = await Promise.all([
        prisma.promotionClash.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            promotionA: { select: { id: true, code: true, name: true } },
            promotionB: { select: { id: true, code: true, name: true } },
          },
        }),
        prisma.promotionClash.count({ where }),
      ]);

      return res.status(200).json({
        data: clashes,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      // Check for clashes between a promotion and others
      const { promotionId } = req.body;

      if (!promotionId) {
        return res.status(400).json({ error: 'Missing required field: promotionId' });
      }

      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: {
          customer: { select: { id: true } },
        },
      });

      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      // Find overlapping promotions
      const overlapping = await prisma.promotion.findMany({
        where: {
          id: { not: promotionId },
          startDate: { lte: promotion.endDate },
          endDate: { gte: promotion.startDate },
        },
        include: {
          customer: { select: { id: true } },
        },
      });

      const clashes: any[] = [];
      for (const other of overlapping) {
        const customerOverlap = promotion.customerId && other.customerId && promotion.customerId === other.customerId;

        if (customerOverlap) {
          clashes.push({
            promotionAId: promotionId,
            promotionBId: other.id,
            companyId: user.companyId || '',
            clashType: 'CUSTOMER_OVERLAP',
            severity: 'MEDIUM',
            description: `Overlaps with ${other.code} on customers`,
            status: 'DETECTED',
            detectedAt: new Date(),
          });
        }
      }

      // Create clashes
      if (clashes.length > 0) {
        await prisma.promotionClash.createMany({
          data: clashes,
          skipDuplicates: true,
        });
      }

      return res.status(200).json({ data: clashes, count: clashes.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Clash detection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
