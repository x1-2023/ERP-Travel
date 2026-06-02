import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /budget-allocations/:id
 * GET - Get single budget allocation
 * PUT/PATCH - Update budget allocation
 * DELETE - Delete budget allocation
 * Sprint 0+1: RBAC + Standard errors
 */

function calculateAvailable(allocated: number, childrenAllocated: number): number {
  return Math.max(0, allocated - childrenAllocated);
}

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid id' } });
  }

  try {
    if (req.method === 'GET') {
      const { includeTree } = req.query as Record<string, string>;

      const allocation = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: {
          budget: { select: { id: true, code: true, name: true, totalAmount: true, year: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, allocatedAmount: true, geographicUnit: true } },
          children: includeTree === 'true' ? {
            orderBy: { createdAt: 'asc' },
            include: {
              geographicUnit: true,
              children: {
                orderBy: { createdAt: 'asc' },
                include: {
                  geographicUnit: true,
                  children: {
                    orderBy: { createdAt: 'asc' },
                    include: { geographicUnit: true },
                  },
                },
              },
            },
          } : {
            orderBy: { createdAt: 'asc' },
            include: { geographicUnit: true },
          },
        },
      });

      if (!allocation) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget allocation not found' } });
      }

      return res.status(200).json({ success: true, data: allocation });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { allocatedAmount, notes, status } = req.body;

      const existing = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: { parent: true, budget: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget allocation not found' } });
      }

      if (existing.status !== 'DRAFT' && allocatedAmount !== undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Can only modify DRAFT allocations' },
        });
      }

      const updateData: Record<string, unknown> = {};

      if (allocatedAmount !== undefined) {
        const newAmount = Number(allocatedAmount);
        const oldAmount = Number(existing.allocatedAmount);
        const childrenAllocated = Number(existing.childrenAllocated);
        const amountDiff = newAmount - oldAmount;

        if (newAmount < childrenAllocated) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `New amount (${newAmount}) is less than children total (${childrenAllocated})` },
          });
        }

        if (existing.parentId && existing.parent) {
          const parentAvailable = Number(existing.parent.availableToAllocate);
          if (amountDiff > parentAvailable) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: `Increase (${amountDiff}) exceeds parent available (${parentAvailable})` },
            });
          }
          await prisma.budgetAllocation.update({
            where: { id: existing.parentId },
            data: {
              childrenAllocated: { increment: amountDiff },
              availableToAllocate: { decrement: amountDiff },
            },
          });
        } else {
          const currentTotal = Number(existing.budget.allocatedAmount);
          const budgetTotal = Number(existing.budget.totalAmount);
          if (currentTotal + amountDiff > budgetTotal) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: 'Total allocations exceed budget total' },
            });
          }
        }

        await prisma.budget.update({
          where: { id: existing.budgetId },
          data: { allocatedAmount: { increment: amountDiff } },
        });

        updateData.allocatedAmount = newAmount;
        updateData.availableToAllocate = calculateAvailable(newAmount, childrenAllocated);
      }

      if (notes !== undefined) updateData.notes = notes;

      if (status !== undefined) {
        const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } });
        }
        updateData.status = status;
        if (status === 'APPROVED') {
          updateData.approvedBy = req.auth.userId;
          updateData.approvedAt = new Date();
        }
      }

      const updated = await prisma.budgetAllocation.update({
        where: { id },
        data: updateData,
        include: {
          budget: { select: { id: true, code: true, name: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.budgetAllocation.findUnique({
        where: { id },
        include: { _count: { select: { children: true } }, parent: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget allocation not found' } });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Can only delete DRAFT allocations' } });
      }
      if (existing._count.children > 0) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot delete: has children' } });
      }

      const deletedAmount = Number(existing.allocatedAmount);

      if (existing.parentId) {
        await prisma.budgetAllocation.update({
          where: { id: existing.parentId },
          data: {
            childrenAllocated: { decrement: deletedAmount },
            availableToAllocate: { increment: deletedAmount },
          },
        });
      }

      await prisma.budget.update({
        where: { id: existing.budgetId },
        data: { allocatedAmount: { decrement: deletedAmount } },
      });

      await prisma.budgetAllocation.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Budget Allocation error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
