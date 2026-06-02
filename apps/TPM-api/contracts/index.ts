import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', status, customerId, search } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const where: Record<string, unknown> = { companyId: userRecord.companyId };
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [contracts, total] = await Promise.all([
        prisma.volumeContract.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, code: true, channel: true } },
            milestones: { orderBy: { deadline: 'asc' } },
            _count: { select: { progress: true } },
          },
        }),
        prisma.volumeContract.count({ where }),
      ]);

      return res.status(200).json({
        data: contracts,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const {
        code, name, customerId: custId, startDate, endDate,
        targetVolume, bonusType, bonusValue, bonusCondition,
        channel, region, categories, notes,
      } = req.body;

      if (!code || !name || !custId || !startDate || !endDate || !targetVolume) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const contract = await prisma.volumeContract.create({
        data: {
          companyId: userRecord.companyId,
          code,
          name,
          customerId: custId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          targetVolume: parseFloat(targetVolume),
          bonusType: bonusType || 'PERCENTAGE',
          bonusValue: parseFloat(bonusValue || '0'),
          bonusCondition: bonusCondition || null,
          channel: channel || null,
          region: region || null,
          categories: categories || [],
          notes: notes || null,
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
        },
      });

      return res.status(201).json({ data: contract });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Contracts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
