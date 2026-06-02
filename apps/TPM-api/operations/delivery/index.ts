/**
 * Delivery API - List and Create
 * GET /api/operations/delivery - List delivery orders
 * POST /api/operations/delivery - Create delivery order
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
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
      return handleList(req, res);
    } else if (req.method === 'POST') {
      return handleCreate(req, res, user.userId);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Delivery API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    status,
    customerId,
    promotionId,
    dateFrom,
    dateTo,
    search,
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (promotionId) {
    where.promotionId = promotionId;
  }

  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
    if (dateTo) where.scheduledDate.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Execute queries
  const [orders, total, statusCounts] = await Promise.all([
    prisma.deliveryOrder.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { scheduledDate: 'desc' },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        promotion: { select: { id: true, code: true, name: true } },
        _count: { select: { lines: true } },
      },
    }),
    prisma.deliveryOrder.count({ where }),
    prisma.deliveryOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  // Calculate summary
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const deliveredThisWeek = await prisma.deliveryOrder.count({
    where: {
      status: 'DELIVERED',
      deliveredAt: { gte: weekStart },
    },
  });

  // Calculate on-time rate
  const deliveredOrders = await prisma.deliveryOrder.findMany({
    where: { status: 'DELIVERED', deliveredAt: { not: null } },
    select: { scheduledDate: true, deliveredAt: true },
    take: 100,
  });

  const onTimeCount = deliveredOrders.filter((o) => {
    if (!o.deliveredAt) return false;
    return new Date(o.deliveredAt) <= new Date(o.scheduledDate);
  }).length;

  const onTimeRate = deliveredOrders.length > 0
    ? Math.round((onTimeCount / deliveredOrders.length) * 100)
    : 100;

  const summary = {
    total,
    pending: statusCounts.find((s) => s.status === 'PENDING')?._count.id || 0,
    inTransit: statusCounts.find((s) => s.status === 'IN_TRANSIT')?._count.id || 0,
    delivered: statusCounts.find((s) => s.status === 'DELIVERED')?._count.id || 0,
    deliveredThisWeek,
    onTimeRate,
    byStatus: statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    summary,
  });
}

async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const {
    promotionId,
    customerId,
    scheduledDate,
    deliveryAddress,
    contactPerson,
    contactPhone,
    notes,
    lines,
  } = req.body;

  // Validate
  if (!customerId) {
    return res.status(400).json({ error: 'Customer is required' });
  }

  if (!scheduledDate) {
    return res.status(400).json({ error: 'Scheduled date is required' });
  }

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'At least one line item is required' });
  }

  // Validate customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    return res.status(400).json({ error: 'Customer not found' });
  }

  // Validate promotion if provided
  if (promotionId) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });
    if (!promotion) {
      return res.status(400).json({ error: 'Promotion not found' });
    }
  }

  // Generate order number
  const orderCount = await prisma.deliveryOrder.count();
  const orderNumber = `DO-${String(orderCount + 1).padStart(6, '0')}`;

  // Create order with lines
  const order = await prisma.deliveryOrder.create({
    data: {
      orderNumber,
      promotionId: promotionId || null,
      customerId,
      status: 'PENDING',
      scheduledDate: new Date(scheduledDate),
      deliveryAddress: deliveryAddress || customer.address,
      contactPerson: contactPerson || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
      createdById: userId,
      lines: {
        create: lines.map((line: any) => ({
          productId: line.productId,
          quantity: line.quantity,
          deliveredQty: 0,
          damagedQty: 0,
          status: 'PENDING',
          notes: line.notes || null,
        })),
      },
      trackingInfo: {
        create: {
          status: 'PENDING',
          notes: 'Order created',
          userId,
        },
      },
    },
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

  return res.status(201).json({
    success: true,
    data: order,
  });
}
