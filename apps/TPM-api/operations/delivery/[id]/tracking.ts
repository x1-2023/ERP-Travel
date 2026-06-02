/**
 * Delivery Tracking API
 * GET /api/operations/delivery/[id]/tracking - Get tracking history
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Verify order exists
    const order = await prisma.deliveryOrder.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        scheduledDate: true,
        deliveredAt: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }

    // Get tracking history
    const tracking = await (prisma as any).deliveryTracking.findMany({
      where: { deliveryOrderId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Calculate time spent in each status
    const statusDurations: Record<string, number> = {};
    for (let i = 0; i < tracking.length - 1; i++) {
      const current = tracking[i];
      const next = tracking[i + 1];
      const duration = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
      statusDurations[current.status] = duration;
    }

    // Format durations
    const formatDuration = (ms: number) => {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const timeline = tracking.map((t: any, idx: number) => ({
      ...t,
      duration: statusDurations[t.status]
        ? formatDuration(statusDurations[t.status])
        : idx === tracking.length - 1 ? 'Current' : null,
      durationMs: statusDurations[t.status] || null,
    }));

    // Calculate total processing time
    const totalTime = tracking.length >= 2
      ? new Date(tracking[tracking.length - 1].timestamp).getTime() -
        new Date(tracking[0].timestamp).getTime()
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          currentStatus: order.status,
          scheduledDate: order.scheduledDate,
          deliveredAt: order.deliveredAt,
        },
        timeline,
        summary: {
          totalEntries: tracking.length,
          totalProcessingTime: formatDuration(totalTime),
          totalProcessingTimeMs: totalTime,
          statusDurations: Object.fromEntries(
            Object.entries(statusDurations).map(([k, v]) => [k, formatDuration(v)])
          ),
        },
      },
    });
  } catch (error: any) {
    console.error('Tracking error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get tracking' });
  }
}
