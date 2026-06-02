import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * Promotion Delivery Detail API
 * GET /api/delivery-profiles/deliveries/:id - Get delivery details
 * PUT /api/delivery-profiles/deliveries/:id - Update delivery (status, POD, etc.)
 * DELETE /api/delivery-profiles/deliveries/:id - Cancel delivery
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
    // GET - Get delivery details
    if (req.method === 'GET') {
      const delivery = await prisma.promotionDelivery.findFirst({
        where: {
          id: id as string,
          companyId: user.companyId,
        },
        include: {
          promotion: {
            select: { id: true, code: true, name: true, status: true, budget: true },
          },
          profile: {
            include: {
              customer: { select: { id: true, code: true, name: true, address: true } },
            },
          },
        },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      return res.status(200).json({ data: delivery });
    }

    // PUT - Update delivery
    if (req.method === 'PUT') {
      const body = req.body;

      // Build update data
      const updateData: any = {};

      if (body.status) updateData.status = body.status;
      if (body.actualDate) updateData.actualDate = new Date(body.actualDate);
      if (body.actualUnits !== undefined) updateData.actualUnits = body.actualUnits;
      if (body.actualValue !== undefined) updateData.actualValue = body.actualValue;
      if (body.priority) updateData.priority = body.priority;
      if (body.deliveryNote !== undefined) updateData.deliveryNote = body.deliveryNote;
      if (body.podReference) updateData.podReference = body.podReference;
      if (body.podSignedBy) updateData.podSignedBy = body.podSignedBy;
      if (body.podSignedAt) updateData.podSignedAt = new Date(body.podSignedAt);

      // Auto-set POD signed timestamp
      if (body.podReference && !body.podSignedAt) {
        updateData.podSignedAt = new Date();
      }

      // If status is DELIVERED and we have actuals, calculate completion
      if (body.status === 'DELIVERED') {
        if (!updateData.actualDate) updateData.actualDate = new Date();
      }

      const delivery = await prisma.promotionDelivery.update({
        where: { id: id as string },
        data: updateData,
        include: {
          promotion: { select: { id: true, code: true, name: true } },
          profile: {
            include: {
              customer: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      return res.status(200).json({ data: delivery });
    }

    // DELETE - Cancel delivery
    if (req.method === 'DELETE') {
      // Soft delete - set status to CANCELLED
      const delivery = await prisma.promotionDelivery.update({
        where: { id: id as string },
        data: {
          status: 'CANCELLED',
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Delivery cancelled',
        data: delivery,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Promotion Delivery API Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
