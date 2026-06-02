import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { managerPlus, type AuthenticatedRequest } from '../_lib/auth';
import { checkVersion, OptimisticLockError } from '../_lib/optimistic-lock';

// Sprint 1: RBAC + Optimistic Locking
export default managerPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    if (req.method === 'GET') {
      const budget = await prisma.budget.findUnique({
        where: { id },
        include: {
          company: { select: { id: true, name: true, code: true } },
          allocations: {
            orderBy: { createdAt: 'desc' },
            include: {
              geographicUnit: { select: { id: true, code: true, name: true, level: true } },
            },
            take: 50,
          },
          approvals: {
            orderBy: { submittedAt: 'desc' },
          },
          activities: {
            orderBy: { startDate: 'desc' },
            take: 20,
          },
          previousPeriod: {
            select: {
              id: true, code: true, name: true, year: true, quarter: true,
              totalAmount: true, spentAmount: true,
            },
          },
        },
      });

      if (!budget) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

      const totalAmount = Number(budget.totalAmount);
      const allocatedAmount = Number(budget.allocatedAmount);
      const spentAmount = Number(budget.spentAmount);

      return res.status(200).json({
        success: true,
        data: {
          ...budget,
          totalAmount,
          allocatedAmount,
          spentAmount,
          utilizationRate: totalAmount > 0 ? Math.round((spentAmount / totalAmount) * 100) : 0,
          allocationRate: totalAmount > 0 ? Math.round((allocatedAmount / totalAmount) * 100) : 0,
          availableAmount: totalAmount - allocatedAmount,
          remainingAmount: totalAmount - spentAmount,
          comparison: budget.previousPeriod ? {
            previousTotalAmount: Number(budget.previousPeriod.totalAmount),
            previousSpentAmount: Number(budget.previousPeriod.spentAmount),
            amountChange: totalAmount - Number(budget.previousPeriod.totalAmount),
            amountChangePercent: Number(budget.previousPeriod.totalAmount) > 0
              ? Math.round(((totalAmount - Number(budget.previousPeriod.totalAmount)) / Number(budget.previousPeriod.totalAmount)) * 100)
              : null,
          } : null,
        },
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { updatedAt: clientUpdatedAt, ...bodyFields } = req.body;

      // Sprint 1 Fix 1: Require version for updates
      if (!clientUpdatedAt) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_VERSION', message: 'updatedAt is required for updates. Refetch the entity and try again.' },
        });
      }

      const currentBudget = await prisma.budget.findUnique({ where: { id } });
      if (!currentBudget) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

      // Sprint 1 Fix 1: Check for conflicts
      checkVersion(currentBudget.updatedAt, clientUpdatedAt, 'Budget', id);

      // Only allow editing DRAFT budgets (or specific fields for non-draft)
      if (currentBudget.approvalStatus !== 'DRAFT' && bodyFields.totalAmount !== undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot modify totalAmount for non-DRAFT budgets. Submit a reallocation request.' },
        });
      }

      const updateData: Record<string, unknown> = {};
      if (bodyFields.name !== undefined) updateData.name = bodyFields.name;
      if (bodyFields.description !== undefined) updateData.description = bodyFields.description;
      if (bodyFields.category !== undefined) updateData.category = bodyFields.category;
      if (bodyFields.fundType !== undefined) updateData.fundType = bodyFields.fundType;
      if (bodyFields.quarter !== undefined) updateData.quarter = bodyFields.quarter ? parseInt(bodyFields.quarter) : null;
      if (bodyFields.startDate !== undefined) updateData.startDate = bodyFields.startDate ? new Date(bodyFields.startDate) : null;
      if (bodyFields.endDate !== undefined) updateData.endDate = bodyFields.endDate ? new Date(bodyFields.endDate) : null;
      if (bodyFields.constraints !== undefined) updateData.constraints = bodyFields.constraints;
      if (bodyFields.isActive !== undefined) updateData.isActive = bodyFields.isActive;

      if (bodyFields.totalAmount !== undefined && currentBudget.approvalStatus === 'DRAFT') {
        const amount = parseFloat(bodyFields.totalAmount);
        updateData.totalAmount = amount;
        let approvalLevel = 1;
        if (amount >= 500_000_000_000) approvalLevel = 3;
        else if (amount >= 100_000_000_000) approvalLevel = 2;
        updateData.approvalLevel = approvalLevel;
      }

      const budget = await prisma.budget.update({
        where: { id },
        data: updateData,
        include: { company: { select: { id: true, name: true, code: true } } },
      });

      return res.status(200).json({
        success: true,
        data: {
          ...budget,
          totalAmount: Number(budget.totalAmount),
          allocatedAmount: Number(budget.allocatedAmount),
          spentAmount: Number(budget.spentAmount),
        },
      });
    }

    if (req.method === 'DELETE') {
      const currentBudget = await prisma.budget.findUnique({
        where: { id },
        include: { _count: { select: { allocations: true } } },
      });
      if (!currentBudget) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });

      if (currentBudget.approvalStatus !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot delete non-DRAFT budgets. Deactivate instead.' },
        });
      }
      if (currentBudget._count.allocations > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot delete budget with existing allocations. Remove allocations first.' },
        });
      }

      await prisma.budget.delete({ where: { id } });
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
          details: {
            entityType: error.entityType,
            entityId: error.entityId,
            yourVersion: error.expectedVersion,
            currentVersion: error.actualVersion,
          },
        },
      });
    }
    console.error('Budget detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
