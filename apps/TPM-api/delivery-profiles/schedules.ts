import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Delivery Schedules API
 * GET /api/delivery-profiles/schedules - List schedules
 * POST /api/delivery-profiles/schedules - Create schedule
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
    // GET - List schedules
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        profileId,
        scheduleType,
        dayOfWeek,
        isActive,
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: any = {
        companyId: user.companyId,
      };

      if (profileId) where.profileId = profileId;
      if (scheduleType) where.scheduleType = scheduleType;
      if (dayOfWeek) where.dayOfWeek = dayOfWeek;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [data, total] = await Promise.all([
        prisma.deliverySchedule.findMany({
          where,
          skip,
          take,
          orderBy: [{ dayOfWeek: 'asc' }, { timeWindowStart: 'asc' }],
          include: {
            profile: {
              include: {
                customer: { select: { id: true, code: true, name: true } },
              },
            },
          },
        }),
        prisma.deliverySchedule.count({ where }),
      ]);

      return res.status(200).json({
        data,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      });
    }

    // POST - Create schedule
    if (req.method === 'POST') {
      const body = req.body;

      // Validate profile exists
      const profile = await prisma.deliveryProfile.findFirst({
        where: { id: body.profileId, companyId: user.companyId },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Delivery profile not found' });
      }

      const schedule = await prisma.deliverySchedule.create({
        data: {
          companyId: user.companyId,
          profileId: body.profileId,
          scheduleType: body.scheduleType || 'RECURRING',
          frequency: body.frequency,
          dayOfWeek: body.dayOfWeek,
          dayOfMonth: body.dayOfMonth,
          weekOfMonth: body.weekOfMonth,
          specificDate: body.specificDate ? new Date(body.specificDate) : null,
          timeWindowStart: body.timeWindowStart,
          timeWindowEnd: body.timeWindowEnd,
          estimatedUnits: body.estimatedUnits,
          estimatedValue: body.estimatedValue,
          priority: body.priority || 'NORMAL',
          effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        },
        include: {
          profile: {
            include: {
              customer: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      return res.status(201).json({ data: schedule });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Delivery Schedules API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
