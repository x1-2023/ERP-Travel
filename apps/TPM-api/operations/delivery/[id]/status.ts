/**
 * Delivery Status API
 * PUT /api/operations/delivery/[id]/status - Update delivery status
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['PICKING', 'CANCELLED'],
  PICKING: ['PACKED', 'CANCELLED'],
  PACKED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'PARTIAL', 'RETURNED'],
  DELIVERED: [],
  PARTIAL: ['DELIVERED'],
  RETURNED: [],
  CANCELLED: [],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const { status, notes, deliveredLines, location } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get current order
    const order = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }

    // Validate status transition
    const validTransitions = STATUS_TRANSITIONS[order.status] || [];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${order.status} to ${status}`,
        validTransitions,
      });
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // If delivered, set deliveredAt
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    // Update lines if delivered/partial
    if (['DELIVERED', 'PARTIAL'].includes(status) && deliveredLines?.length) {
      for (const dl of deliveredLines) {
        const line = order.lines.find((l) => l.id === dl.lineId);
        if (line) {
          await prisma.deliveryLine.update({
            where: { id: dl.lineId },
            data: {
              deliveredQty: dl.deliveredQty,
              damagedQty: dl.damagedQty || 0,
              status: dl.deliveredQty >= line.quantity ? 'DELIVERED' : 'PARTIAL',
            },
          });
        }
      }

      // Check if all lines are delivered
      const updatedLines = await prisma.deliveryLine.findMany({
        where: { deliveryOrderId: id },
      });
      const allDelivered = updatedLines.every(
        (l) => l.deliveredQty >= l.quantity
      );
      if (allDelivered && status === 'PARTIAL') {
        updateData.status = 'DELIVERED';
        updateData.deliveredAt = new Date();
      }
    }

    // Update line statuses based on order status
    const lineStatusMap: Record<string, string> = {
      PICKING: 'PICKED',
      PACKED: 'PACKED',
      CANCELLED: 'CANCELLED',
      RETURNED: 'RETURNED',
    };

    if (lineStatusMap[status]) {
      await prisma.deliveryLine.updateMany({
        where: { deliveryOrderId: id, status: { not: 'DELIVERED' } },
        data: { status: lineStatusMap[status] as any },
      });
    }

    // Update order
    const updated = await prisma.deliveryOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        lines: {
          include: {
            product: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    });

    // Create tracking entry
    await (prisma as any).deliveryTracking.create({
      data: {
        deliveryOrderId: id,
        status: updateData.status,
        notes: notes || null,
        userId: user.userId,
        location: location || null,
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Status updated to ${updateData.status}`,
    });
  } catch (error: any) {
    console.error('Status update error:', error);
    return res.status(500).json({ error: error.message || 'Status update failed' });
  }
}
