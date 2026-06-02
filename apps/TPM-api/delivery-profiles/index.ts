import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Delivery Profiles API
 * GET /api/delivery-profiles - List delivery profiles
 * POST /api/delivery-profiles - Create delivery profile
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
    // GET - List delivery profiles
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '50',
        customerId,
        routeCode,
        isActive,
        deliveryRegion,
        deliveryDay,
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: any = {
        companyId: user.companyId,
      };

      if (customerId) where.customerId = customerId;
      if (routeCode) where.routeCode = routeCode;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (deliveryRegion) where.deliveryRegion = deliveryRegion;
      if (deliveryDay) where.preferredDays = { has: deliveryDay };

      const [data, total] = await Promise.all([
        prisma.deliveryProfile.findMany({
          where,
          skip,
          take,
          orderBy: [{ routeCode: 'asc' }, { routeSequence: 'asc' }],
          include: {
            customer: { select: { id: true, code: true, name: true, channel: true } },
            schedules: { where: { isActive: true } },
            _count: { select: { promotionDeliveries: true } },
          },
        }),
        prisma.deliveryProfile.count({ where }),
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

    // POST - Create delivery profile
    if (req.method === 'POST') {
      const body = req.body;

      // Check if customer already has a profile
      const existing = await prisma.deliveryProfile.findUnique({
        where: { customerId: body.customerId },
      });

      if (existing) {
        return res.status(409).json({
          error: 'Customer already has a delivery profile',
          existingProfileId: existing.id,
        });
      }

      const profile = await prisma.deliveryProfile.create({
        data: {
          companyId: user.companyId,
          customerId: body.customerId,
          deliveryAddress: body.deliveryAddress,
          deliveryCity: body.deliveryCity,
          deliveryRegion: body.deliveryRegion,
          deliveryZone: body.deliveryZone,
          contactPerson: body.contactPerson,
          contactPhone: body.contactPhone,
          contactEmail: body.contactEmail,
          preferredDays: body.preferredDays || [],
          preferredTimeStart: body.preferredTimeStart,
          preferredTimeEnd: body.preferredTimeEnd,
          standardLeadTime: body.standardLeadTime || 2,
          expressLeadTime: body.expressLeadTime,
          maxDeliveriesPerWeek: body.maxDeliveriesPerWeek,
          maxUnitsPerDelivery: body.maxUnitsPerDelivery,
          warehouseCapacity: body.warehouseCapacity,
          requiresAppointment: body.requiresAppointment || false,
          requiresPOD: body.requiresPOD ?? true,
          specialInstructions: body.specialInstructions,
          blackoutDates: body.blackoutDates || [],
          holidaySchedule: body.holidaySchedule,
          routeCode: body.routeCode,
          routeSequence: body.routeSequence,
          distanceFromDC: body.distanceFromDC,
          createdById: user.userId,
        },
        include: {
          customer: { select: { id: true, code: true, name: true } },
        },
      });

      return res.status(201).json({ data: profile });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Delivery Profiles API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
