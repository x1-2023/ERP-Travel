import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';
import { checkVersion, OptimisticLockError } from '../_lib/optimistic-lock';

/**
 * /fund-activities/:id
 * GET - Get single fund activity
 * PUT/PATCH - Update fund activity (spent amount, revenue, status)
 * DELETE - Delete fund activity
 * Sprint 0+1: RBAC + Optimistic Locking + Standard errors
 */

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing activity id' } });

  try {
    const activity = await prisma.fundActivity.findUnique({
      where: { id },
      include: {
        budget: {
          select: {
            id: true,
            code: true,
            name: true,
            totalAmount: true,
            spentAmount: true,
          },
        },
        budgetAllocation: {
          select: {
            id: true,
            code: true,
            allocatedAmount: true,
            spentAmount: true,
            geographicUnit: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fund activity not found' } });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          ...activity,
          allocatedAmount: Number(activity.allocatedAmount),
          spentAmount: Number(activity.spentAmount),
          revenueGenerated: activity.revenueGenerated
            ? Number(activity.revenueGenerated)
            : null,
          roi: activity.roi ? Number(activity.roi) : null,
          budget: activity.budget
            ? {
                ...activity.budget,
                totalAmount: Number(activity.budget.totalAmount),
                spentAmount: Number(activity.budget.spentAmount),
              }
            : null,
          budgetAllocation: activity.budgetAllocation
            ? {
                ...activity.budgetAllocation,
                allocatedAmount: Number(activity.budgetAllocation.allocatedAmount),
                spentAmount: Number(activity.budgetAllocation.spentAmount),
              }
            : null,
        },
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const {
        updatedAt: clientUpdatedAt,
        activityName,
        activityCode,
        allocatedAmount,
        spentAmount,
        revenueGenerated,
        unitsImpacted,
        startDate,
        endDate,
        status,
        notes,
      } = req.body;

      // Sprint 1 Fix 1: Optimistic locking
      if (!clientUpdatedAt) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_VERSION', message: 'updatedAt is required for updates.' },
        });
      }
      checkVersion(activity.updatedAt, clientUpdatedAt, 'FundActivity', id);

      const updateData: Record<string, unknown> = {};

      if (activityName !== undefined) updateData.activityName = activityName;
      if (activityCode !== undefined) updateData.activityCode = activityCode;
      if (allocatedAmount !== undefined) {
        updateData.allocatedAmount = Number(allocatedAmount);
      }
      if (spentAmount !== undefined) {
        updateData.spentAmount = Number(spentAmount);
      }
      if (revenueGenerated !== undefined) {
        updateData.revenueGenerated = revenueGenerated
          ? Number(revenueGenerated)
          : null;
      }
      if (unitsImpacted !== undefined) updateData.unitsImpacted = unitsImpacted;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (notes !== undefined) updateData.notes = notes;

      if (status !== undefined) {
        const validStatuses = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          });
        }
        updateData.status = status;
      }

      // Calculate ROI if we have spent and revenue
      const finalSpent =
        spentAmount !== undefined
          ? Number(spentAmount)
          : Number(activity.spentAmount);
      const finalRevenue =
        revenueGenerated !== undefined
          ? Number(revenueGenerated)
          : activity.revenueGenerated
            ? Number(activity.revenueGenerated)
            : 0;

      if (finalSpent > 0 && finalRevenue > 0) {
        updateData.roi = finalRevenue / finalSpent;
      }

      const updated = await prisma.fundActivity.update({
        where: { id },
        data: updateData,
        include: {
          budget: {
            select: { id: true, code: true, name: true },
          },
          budgetAllocation: {
            select: { id: true, code: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          ...updated,
          allocatedAmount: Number(updated.allocatedAmount),
          spentAmount: Number(updated.spentAmount),
          revenueGenerated: updated.revenueGenerated
            ? Number(updated.revenueGenerated)
            : null,
          roi: updated.roi ? Number(updated.roi) : null,
        },
      });
    }

    if (req.method === 'DELETE') {
      if (activity.status !== 'PLANNED') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Can only delete PLANNED activities' },
        });
      }

      await prisma.fundActivity.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    if (error instanceof OptimisticLockError) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: error.message,
          details: { entityType: error.entityType, entityId: error.entityId },
        },
      });
    }
    console.error('Fund activity detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
