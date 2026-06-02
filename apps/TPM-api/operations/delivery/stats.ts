/**
 * Delivery Stats API
 * GET /api/operations/delivery/stats - Get delivery statistics
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
    const { period = '30' } = req.query as Record<string, string>;
    const periodDays = parseInt(period, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get counts by status
    const statusCounts = await prisma.deliveryOrder.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get orders in period
    const ordersInPeriod = await prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        deliveredAt: true,
        createdAt: true,
      },
    });

    // Calculate on-time delivery rate
    const deliveredOrders = ordersInPeriod.filter((o) => o.status === 'DELIVERED');
    const onTimeOrders = deliveredOrders.filter((o) => {
      if (!o.deliveredAt) return false;
      return new Date(o.deliveredAt) <= new Date(o.scheduledDate);
    });
    const onTimeRate = deliveredOrders.length > 0
      ? Math.round((onTimeOrders.length / deliveredOrders.length) * 100)
      : 100;

    // Calculate average delivery time
    const deliveryTimes = deliveredOrders
      .filter((o) => o.deliveredAt)
      .map((o) => {
        return new Date(o.deliveredAt!).getTime() - new Date(o.createdAt).getTime();
      });
    const avgDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      : 0;
    const avgDeliveryDays = Math.round(avgDeliveryTime / (1000 * 60 * 60 * 24) * 10) / 10;

    // Daily trend for the period
    const dailyTrend: Record<string, { created: number; delivered: number }> = {};
    for (let i = 0; i < periodDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend[dateStr] = { created: 0, delivered: 0 };
    }

    for (const order of ordersInPeriod) {
      const createdDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyTrend[createdDate]) {
        dailyTrend[createdDate].created++;
      }
      if (order.deliveredAt) {
        const deliveredDate = new Date(order.deliveredAt).toISOString().split('T')[0];
        if (dailyTrend[deliveredDate]) {
          dailyTrend[deliveredDate].delivered++;
        }
      }
    }

    // Top customers by delivery count
    const topCustomers = await prisma.deliveryOrder.groupBy({
      by: ['customerId'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Get customer names
    const customerIds = topCustomers.map((c) => c.customerId);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    });

    const topCustomersWithNames = topCustomers.map((tc) => ({
      customerId: tc.customerId,
      customerName: customers.find((c) => c.id === tc.customerId)?.name || 'Unknown',
      orderCount: tc._count.id,
    }));

    return res.status(200).json({
      success: true,
      data: {
        period: periodDays,
        overview: {
          total: statusCounts.reduce((sum, s) => sum + s._count.id, 0),
          byStatus: statusCounts.reduce(
            (acc, item) => {
              acc[item.status] = item._count.id;
              return acc;
            },
            {} as Record<string, number>
          ),
        },
        performance: {
          ordersInPeriod: ordersInPeriod.length,
          deliveredInPeriod: deliveredOrders.length,
          onTimeRate,
          avgDeliveryDays,
        },
        trend: Object.entries(dailyTrend)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        topCustomers: topCustomersWithNames,
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get stats' });
  }
}
