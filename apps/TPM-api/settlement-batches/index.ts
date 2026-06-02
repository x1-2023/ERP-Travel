import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { financePlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';
import { createSettlementBatch } from '../_lib/settlement-service';

// GET/POST /api/settlement-batches
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { status } = req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {};
      if (status) where.status = status;

      const [batches, total] = await Promise.all([
        prisma.settlementBatch.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { settlements: true } },
          },
        }),
        prisma.settlementBatch.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: batches,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const { settlementIds, batchDate, notes } = req.body;

      if (!settlementIds || !Array.isArray(settlementIds) || settlementIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'settlementIds array is required' },
        });
      }

      try {
        const batch = await createSettlementBatch(
          req.auth.companyId,
          settlementIds,
          batchDate ? new Date(batchDate) : new Date(),
          notes,
          req.auth.userId
        );
        return res.status(201).json({ success: true, data: batch });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to create batch';
        return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: msg } });
      }
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Settlement batches error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
