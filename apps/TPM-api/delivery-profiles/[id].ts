import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

/**
 * Delivery Profile Detail API
 * GET /api/delivery-profiles/:id - Get profile details
 * PUT /api/delivery-profiles/:id - Update profile
 * DELETE /api/delivery-profiles/:id - Delete profile
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET - Get profile details
    if (req.method === 'GET') {
      const profile = await prisma.deliveryProfile.findFirst({
        where: {
          id: id as string,
          companyId: user.companyId,
        },
        include: {
          customer: { select: { id: true, code: true, name: true, channel: true, address: true } },
          schedules: {
            orderBy: { dayOfWeek: 'asc' },
          },
          promotionDeliveries: {
            take: 10,
            orderBy: { plannedDate: 'desc' },
            include: {
              promotion: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Delivery profile not found' });
      }

      return res.status(200).json({ data: profile });
    }

    // PUT - Update profile
    if (req.method === 'PUT') {
      const body = req.body;

      const profile = await prisma.deliveryProfile.update({
        where: { id: id as string },
        data: {
          deliveryAddress: body.deliveryAddress,
          deliveryCity: body.deliveryCity,
          deliveryRegion: body.deliveryRegion,
          deliveryZone: body.deliveryZone,
          contactPerson: body.contactPerson,
          contactPhone: body.contactPhone,
          contactEmail: body.contactEmail,
          preferredDays: body.preferredDays,
          preferredTimeStart: body.preferredTimeStart,
          preferredTimeEnd: body.preferredTimeEnd,
          standardLeadTime: body.standardLeadTime,
          expressLeadTime: body.expressLeadTime,
          maxDeliveriesPerWeek: body.maxDeliveriesPerWeek,
          maxUnitsPerDelivery: body.maxUnitsPerDelivery,
          warehouseCapacity: body.warehouseCapacity,
          requiresAppointment: body.requiresAppointment,
          requiresPOD: body.requiresPOD,
          specialInstructions: body.specialInstructions,
          blackoutDates: body.blackoutDates,
          holidaySchedule: body.holidaySchedule,
          routeCode: body.routeCode,
          routeSequence: body.routeSequence,
          distanceFromDC: body.distanceFromDC,
          avgDeliveryTime: body.avgDeliveryTime,
          onTimeRate: body.onTimeRate,
          isActive: body.isActive,
        },
        include: {
          customer: { select: { id: true, code: true, name: true } },
          schedules: true,
        },
      });

      return res.status(200).json({ data: profile });
    }

    // DELETE - Delete profile
    if (req.method === 'DELETE') {
      // Check if there are pending deliveries
      const pendingDeliveries = await prisma.promotionDelivery.count({
        where: {
          profileId: id as string,
          status: { in: ['PLANNED', 'CONFIRMED', 'IN_TRANSIT'] },
        },
      });

      if (pendingDeliveries > 0) {
        return res.status(400).json({
          error: 'Cannot delete profile with pending deliveries',
          pendingCount: pendingDeliveries,
        });
      }

      // Delete schedules first
      await prisma.deliverySchedule.deleteMany({
        where: { profileId: id as string },
      });

      // Delete profile
      await prisma.deliveryProfile.delete({
        where: { id: id as string },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Delivery Profile API Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Delivery profile not found' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
