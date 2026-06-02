import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';

// Sprint 0: RBAC (kamPlus), Pagination cap, Budget over-allocation check
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { status, customerId, search } = req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {
        fund: { company: { users: { some: { id: req.auth.userId } } } },
      };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [promotions, total] = await Promise.all([
        prisma.promotion.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, channel: true } },
            fund: { select: { id: true, name: true, code: true } },
            _count: { select: { tactics: true, claims: true } },
          },
        }),
        prisma.promotion.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: promotions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, description, customerId, fundId, startDate, endDate, budget } = req.body;

      if (!code || !name || !customerId || !fundId || !startDate || !endDate || !budget) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
        });
      }

      const budgetAmount = parseFloat(budget);

      // Sprint 0 Fix 7: Budget over-allocation check
      if (fundId && budgetAmount > 0) {
        const fund = await prisma.fund.findUnique({
          where: { id: fundId },
          select: { id: true, totalBudget: true, committed: true, available: true },
        });

        if (!fund) {
          return res.status(400).json({
            success: false,
            error: { code: 'FUND_NOT_FOUND', message: 'Fund not found' },
          });
        }

        const available = Number(fund.available);
        if (budgetAmount > available) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_FUND',
              message: `Insufficient fund balance. Available: ${available.toLocaleString()}₫, Requested: ${budgetAmount.toLocaleString()}₫`,
              details: { available, requested: budgetAmount },
            },
          });
        }
      }

      // Create promotion and update fund in a transaction
      const promotion = await prisma.$transaction(async (tx) => {
        const created = await tx.promotion.create({
          data: {
            code,
            name,
            description: description || null,
            customerId,
            fundId,
            createdById: req.auth.userId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget: budgetAmount,
          },
        });

        // Update fund committed/available amounts
        if (fundId && budgetAmount > 0) {
          await tx.fund.update({
            where: { id: fundId },
            data: {
              committed: { increment: budgetAmount },
              available: { decrement: budgetAmount },
            },
          });
        }

        return created;
      });

      return res.status(201).json({ success: true, data: promotion });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Promotions error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
