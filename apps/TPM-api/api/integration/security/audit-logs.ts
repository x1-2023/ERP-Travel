/**
 * Audit Logs API
 * GET /api/integration/security/audit-logs - List audit logs
 * Sprint 0 Fix 3: ADMIN ONLY - Audit logs are sensitive
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { adminOnly, type AuthenticatedRequest } from '../../../_lib/auth';

export default adminOnly(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      page = '1',
      pageSize = '50',
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limit = Math.min(parseInt(pageSize as string, 10) || 50, 100);
    const skip = (pageNum - 1) * limit;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }
    if (action && action !== 'all') {
      where.action = action;
    }
    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }
    if (entityId) {
      where.entityId = entityId;
    }
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) {
        (where.timestamp as Record<string, unknown>).gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        (where.timestamp as Record<string, unknown>).lte = new Date(dateTo as string);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.immutableAuditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.immutableAuditLog.count({ where }),
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
    console.error('Audit Logs API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
