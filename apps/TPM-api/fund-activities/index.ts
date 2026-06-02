import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /fund-activities
 * GET - List fund activities with filtering
 * POST - Create new fund activity (link budget to activity)
 * Sprint 0+1: RBAC + Pagination cap + Standard errors
 */

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const {
        budgetId,
        budgetAllocationId,
        activityType,
        status,
        promotionId,
      } = req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {};
      if (budgetId) where.budgetId = budgetId;
      if (budgetAllocationId) where.budgetAllocationId = budgetAllocationId;
      if (activityType) where.activityType = activityType;
      if (status) where.status = status;
      if (promotionId) where.promotionId = promotionId;

      const [activities, total] = await Promise.all([
        prisma.fundActivity.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            budget: {
              select: { id: true, code: true, name: true, totalAmount: true },
            },
            budgetAllocation: {
              select: { id: true, code: true, allocatedAmount: true },
            },
          },
        }),
        prisma.fundActivity.count({ where }),
      ]);

      const transformed = activities.map((a) => ({
        ...a,
        allocatedAmount: Number(a.allocatedAmount),
        spentAmount: Number(a.spentAmount),
        revenueGenerated: a.revenueGenerated ? Number(a.revenueGenerated) : null,
        roi: a.roi ? Number(a.roi) : null,
        budget: a.budget
          ? {
              ...a.budget,
              totalAmount: Number(a.budget.totalAmount),
            }
          : null,
        budgetAllocation: a.budgetAllocation
          ? {
              ...a.budgetAllocation,
              allocatedAmount: Number(a.budgetAllocation.allocatedAmount),
            }
          : null,
      }));

      return res.status(200).json({
        success: true,
        data: transformed,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const {
        budgetId,
        budgetAllocationId,
        promotionId,
        activityType,
        activityName,
        activityCode,
        allocatedAmount,
        startDate,
        endDate,
        notes,
      } = req.body;

      if (!budgetId || !activityType || !activityName || allocatedAmount === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: budgetId, activityType, activityName, allocatedAmount' },
        });
      }

      const budget = await prisma.budget.findUnique({
        where: { id: budgetId },
      });
      if (!budget) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
      }

      if (budgetAllocationId) {
        const allocation = await prisma.budgetAllocation.findUnique({
          where: { id: budgetAllocationId },
        });
        if (!allocation) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget allocation not found' } });
        }
        if (allocation.budgetId !== budgetId) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Allocation does not belong to specified budget' },
          });
        }
      }

      const validTypes = ['promotion', 'display', 'sampling', 'event', 'listing_fee'];
      if (!validTypes.includes(activityType)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` },
        });
      }

      const activity = await prisma.fundActivity.create({
        data: {
          budgetId,
          budgetAllocationId: budgetAllocationId || null,
          promotionId: promotionId || null,
          activityType,
          activityName,
          activityCode: activityCode || null,
          allocatedAmount: Number(allocatedAmount),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(),
          notes: notes || null,
          createdBy: req.auth.userId,
        },
        include: {
          budget: {
            select: { id: true, code: true, name: true },
          },
          budgetAllocation: {
            select: { id: true, code: true },
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          ...activity,
          allocatedAmount: Number(activity.allocatedAmount),
          spentAmount: Number(activity.spentAmount),
        },
      });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Fund activity error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
