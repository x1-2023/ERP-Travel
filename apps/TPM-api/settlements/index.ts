/**
 * Phase 6: Enhanced Settlements API
 * GET /api/settlements - List settlements with filters
 * POST /api/settlements - Create settlement via service
 */

import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { financePlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';
import { createSettlement } from '../_lib/settlement-service';

export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { claimId, status, batchId, paymentMethod, dateFrom, dateTo } =
        req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {};
      if (claimId) where.claimId = claimId;
      if (status) where.status = status;
      if (batchId) where.batchId = batchId;
      if (paymentMethod) where.paymentMethod = paymentMethod;
      if (dateFrom || dateTo) {
        where.settledAt = {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        };
      }

      const [settlements, total] = await Promise.all([
        prisma.settlement.findMany({
          where,
          skip,
          take: limit,
          orderBy: { settledAt: 'desc' },
          include: {
            claim: {
              select: {
                id: true, code: true, amount: true, status: true, claimedAmount: true,
                customer: { select: { id: true, name: true } },
              },
            },
            batch: { select: { id: true, code: true, status: true } },
          },
        }),
        prisma.settlement.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: settlements,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const { claimId, amount, paymentMethod, notes } = req.body;

      if (!claimId || amount === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'claimId and amount are required' },
        });
      }

      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'amount must be a positive number' },
        });
      }

      try {
        const settlement = await createSettlement(
          claimId,
          parsedAmount,
          paymentMethod,
          req.auth.userId
        );
        return res.status(201).json({ success: true, data: settlement });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to create settlement';
        if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
        if (msg.includes('Cannot settle') || msg.includes('exceeds')) {
          return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: msg } });
        }
        throw error;
      }
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Settlements error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
