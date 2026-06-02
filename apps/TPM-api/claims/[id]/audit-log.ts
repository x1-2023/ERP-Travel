import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { kamPlus, parsePagination, type AuthenticatedRequest } from '../../_lib/auth';

// GET /api/claims/:id/audit-log - Get claim audit log entries
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

    const [logs, total] = await Promise.all([
      prisma.claimAuditLog.findMany({
        where: { claimId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.claimAuditLog.count({ where: { claimId: id } }),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Claim audit log error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
