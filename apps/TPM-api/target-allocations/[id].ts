import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /target-allocations/:id
 * GET - Get single target allocation
 * PUT/PATCH - Update target allocation (value, achieved, status)
 * DELETE - Delete target allocation
 * Sprint 0+1: RBAC + Standard errors
 */

function calculateProgress(achieved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((achieved / target) * 1000) / 10);
}

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid id' } });
  }

  try {
    if (req.method === 'GET') {
      const { includeTree } = req.query as Record<string, string>;

      const allocation = await prisma.targetAllocation.findUnique({
        where: { id },
        include: {
          target: { select: { id: true, code: true, name: true, totalTarget: true, metric: true, year: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, targetValue: true, geographicUnit: true } },
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
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target allocation not found' } });
      }

      return res.status(200).json({ success: true, data: allocation });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { targetValue, achievedValue, notes, status } = req.body;

      const existing = await prisma.targetAllocation.findUnique({
        where: { id },
        include: { parent: true, target: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target allocation not found' } });
      }

      const updateData: Record<string, unknown> = {};

      if (targetValue !== undefined) {
        if (existing.status !== 'DRAFT') {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Can only modify target value for DRAFT allocations' },
          });
        }

        const newValue = Number(targetValue);
        const oldValue = Number(existing.targetValue);
        const childrenTarget = Number(existing.childrenTarget);
        const valueDiff = newValue - oldValue;

        if (newValue < childrenTarget) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `New value (${newValue}) is less than children total (${childrenTarget})` },
          });
        }

        if (existing.parentId && existing.parent) {
          const parentValue = Number(existing.parent.targetValue);
          const parentChildren = Number(existing.parent.childrenTarget);
          const parentRemaining = parentValue - parentChildren + oldValue;
          if (newValue > parentRemaining) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: `New value (${newValue}) exceeds parent remaining (${parentRemaining})` },
            });
          }
          await prisma.targetAllocation.update({
            where: { id: existing.parentId },
            data: { childrenTarget: { increment: valueDiff } },
          });
        } else {
          const currentRootTotal = await prisma.targetAllocation.aggregate({
            where: { targetId: existing.targetId, parentId: null, id: { not: id } },
            _sum: { targetValue: true },
          });
          const otherRoot = Number(currentRootTotal._sum.targetValue || 0);
          if (otherRoot + newValue > Number(existing.target.totalTarget)) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: 'Total root allocations exceed target total' },
            });
          }
        }

        updateData.targetValue = newValue;
      }

      if (achievedValue !== undefined) {
        const newAchieved = Number(achievedValue);
        updateData.achievedValue = newAchieved;
        const targetVal = targetValue !== undefined ? Number(targetValue) : Number(existing.targetValue);
        updateData.progressPercent = calculateProgress(newAchieved, targetVal);

        // Propagate total achieved up to target
        const allAllocations = await prisma.targetAllocation.findMany({
          where: { targetId: existing.targetId },
        });
        const totalAchieved = allAllocations.reduce((sum, alloc) => {
          if (alloc.id === id) return sum + newAchieved;
          return sum + Number(alloc.achievedValue);
        }, 0);
        await prisma.target.update({
          where: { id: existing.targetId },
          data: { totalAchieved },
        });
      }

      if (notes !== undefined) updateData.notes = notes;

      if (status !== undefined) {
        const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'LOCKED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } });
        }
        updateData.status = status;
      }

      const updated = await prisma.targetAllocation.update({
        where: { id },
        data: updateData,
        include: {
          target: { select: { id: true, code: true, name: true, metric: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.targetAllocation.findUnique({
        where: { id },
        include: { _count: { select: { children: true } }, parent: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target allocation not found' } });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Can only delete DRAFT allocations' } });
      }
      if (existing._count.children > 0) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot delete: has children' } });
      }

      const deletedValue = Number(existing.targetValue);
      if (existing.parentId) {
        await prisma.targetAllocation.update({
          where: { id: existing.parentId },
          data: { childrenTarget: { decrement: deletedValue } },
        });
      }

      await prisma.targetAllocation.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Target Allocation error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
