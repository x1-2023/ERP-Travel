/**
 * ERP Sync Logs API
 * GET /api/integration/erp/:id/logs - Get sync logs
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Connection ID is required' });
  }

  try {
    const { status, entityType, dateFrom, dateTo, page = '1', pageSize = '20' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limit = Math.min(parseInt(pageSize as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limit;

    const where: Record<string, unknown> = { connectionId: id };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }
    if (dateFrom || dateTo) {
      where.startedAt = {};
      if (dateFrom) {
        (where.startedAt as Record<string, unknown>).gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        (where.startedAt as Record<string, unknown>).lte = new Date(dateTo as string);
      }
    }

    const [logs, total] = await Promise.all([
      (prisma as any).eRPSyncLog.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).eRPSyncLog.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('ERP logs API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
