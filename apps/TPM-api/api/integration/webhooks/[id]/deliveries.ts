/**
 * Webhook Deliveries API
 * GET /api/integration/webhooks/:id/deliveries - Get delivery logs
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Endpoint ID is required' });
  }

  try {
    const { status, event, dateFrom, dateTo, page = '1', pageSize = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limit = Math.min(parseInt(pageSize as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limit;

    const where: Record<string, unknown> = { endpointId: id };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (event && event !== 'all') {
      where.event = event;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo as string);
      }
    }

    const [deliveries, total] = await Promise.all([
      (prisma as any).webhookDelivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).webhookDelivery.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        page: pageNum,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Webhook deliveries API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
