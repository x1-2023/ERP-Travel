/**
 * Delivery Order API - Single Order Operations
 * GET /api/operations/delivery/[id] - Get order details
 * PUT /api/operations/delivery/[id] - Update order
 * DELETE /api/operations/delivery/[id] - Delete order
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(id, res);
    } else if (req.method === 'PUT') {
      return handleUpdate(id, req, res);
    } else if (req.method === 'DELETE') {
      return handleDelete(id, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Delivery order API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          address: true,
        },
      },
      promotion: {
        select: {
          id: true,
          code: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
      lines: {
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ error: 'Delivery order not found' });
  }

  // Calculate totals
  const orderWithLines = order as any;
  const totalItems = orderWithLines.lines.reduce((sum: any, line: any) => sum + line.quantity, 0);
  const totalDelivered = orderWithLines.lines.reduce((sum: any, line: any) => sum + line.deliveredQty, 0);
  const totalValue = orderWithLines.lines.reduce((sum: any, line: any) => {
    const price = line.product?.price?.toNumber?.() || line.product?.price || 0;
    return sum + line.quantity * price;
  }, 0);

  return res.status(200).json({
    success: true,
    data: {
      ...order,
      totalItems,
      totalDelivered,
      totalValue,
    },
  });
}

async function handleUpdate(id: string, req: VercelRequest, res: VercelResponse) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
  });

  if (!order) {
    return res.status(404).json({ error: 'Delivery order not found' });
  }

  // Can only update if not delivered/cancelled
  if (['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)) {
    return res.status(400).json({
      error: `Cannot update order with status ${order.status}`,
    });
  }

  const {
    scheduledDate,
    deliveryAddress,
    contactPerson,
    contactPhone,
    notes,
  } = req.body;

  const updateData: any = { updatedAt: new Date() };

  if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
  if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
  if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
  if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
  if (notes !== undefined) updateData.notes = notes;

  const updated = await prisma.deliveryOrder.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, code: true, name: true } },
      promotion: { select: { id: true, code: true, name: true } },
      lines: {
        include: {
          product: { select: { id: true, sku: true, name: true } },
        },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: updated,
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const order = await prisma.deliveryOrder.findUnique({
    where: { id },
  });

  if (!order) {
    return res.status(404).json({ error: 'Delivery order not found' });
  }

  // Can only delete if pending
  if (order.status !== 'PENDING') {
    return res.status(400).json({
      error: 'Can only delete orders with PENDING status',
    });
  }

  // Delete in transaction
  await prisma.$transaction([
    (prisma as any).deliveryTracking.deleteMany({ where: { deliveryOrderId: id } }),
    prisma.deliveryLine.deleteMany({ where: { deliveryOrderId: id } }),
    prisma.deliveryOrder.delete({ where: { id } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Delivery order deleted',
  });
}
