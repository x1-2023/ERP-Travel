/**
 * Delivery Calendar API
 * GET /api/operations/delivery/calendar - Get calendar view
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { month, year, customerId } = req.query as Record<string, string>;

    // Default to current month
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month, 10) - 1 : new Date().getMonth();

    // Calculate date range
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Build where clause
    const where: any = {
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (customerId) {
      where.customerId = customerId;
    }

    // Fetch orders for the month
    const orders = await prisma.deliveryOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Group by date
    const calendarDays: Record<string, any> = {};

    // Initialize all days of the month
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      calendarDays[dateStr] = {
        date: dateStr,
        orders: [],
        totalOrders: 0,
        deliveredCount: 0,
        pendingCount: 0,
        inTransitCount: 0,
      };
    }

    // Populate with orders
    for (const order of orders) {
      const dateStr = new Date(order.scheduledDate).toISOString().split('T')[0];
      if (calendarDays[dateStr]) {
        calendarDays[dateStr].orders.push(order);
        calendarDays[dateStr].totalOrders++;

        if (order.status === 'DELIVERED') {
          calendarDays[dateStr].deliveredCount++;
        } else if (order.status === 'IN_TRANSIT') {
          calendarDays[dateStr].inTransitCount++;
        } else if (!['CANCELLED', 'RETURNED'].includes(order.status)) {
          calendarDays[dateStr].pendingCount++;
        }
      }
    }

    // Calculate month summary
    const summary = {
      totalOrders: orders.length,
      delivered: orders.filter((o) => o.status === 'DELIVERED').length,
      inTransit: orders.filter((o) => o.status === 'IN_TRANSIT').length,
      pending: orders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'SCHEDULED', 'PICKING', 'PACKED'].includes(o.status)
      ).length,
      cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
      busiestDay: Object.values(calendarDays).reduce(
        (max, day: any) => (day.totalOrders > max.totalOrders ? day : max),
        { date: null, totalOrders: 0 }
      ),
    };

    return res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth + 1,
        days: Object.values(calendarDays),
      },
      summary,
    });
  } catch (error: any) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get calendar' });
  }
}
