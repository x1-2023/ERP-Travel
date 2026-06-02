import type { VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../../../_lib/auth';
import { checkVersion, OptimisticLockError } from '../../../_lib/optimistic-lock';

/**
 * /targets/:id/allocation/:allocId
 * GET - Get specific allocation
 * PUT - Update allocation (target value, notes)
 * DELETE - Delete allocation
 * Sprint 0+1: RBAC + Optimistic Locking + Standard errors
 */

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id: targetId, allocId } = req.query as { id: string; allocId: string };
  if (!targetId || !allocId) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing target id or allocation id' } });
  }

  try {
    const allocation = await prisma.targetAllocation.findUnique({
      where: { id: allocId },
      include: {
        target: true,
        geographicUnit: true,
        parent: true,
        children: { include: { geographicUnit: true } },
      },
    });

    if (!allocation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Allocation not found' } });
    }
    if (allocation.targetId !== targetId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Allocation does not belong to this target' } });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        data: {
          ...allocation,
          targetValue: Number(allocation.targetValue),
          achievedValue: Number(allocation.achievedValue),
          childrenTarget: Number(allocation.childrenTarget),
          progressPercent: Number(allocation.progressPercent),
        },
      });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { updatedAt: clientUpdatedAt, targetValue, notes, status } = req.body;

      // Sprint 1 Fix 1: Optimistic locking
      if (!clientUpdatedAt) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_VERSION', message: 'updatedAt is required for updates.' },
        });
      }
      checkVersion(allocation.updatedAt, clientUpdatedAt, 'TargetAllocation', allocId);

      const updateData: Record<string, unknown> = {};

      if (targetValue !== undefined) {
        if (allocation.status !== 'DRAFT') {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Can only modify target value for DRAFT allocations' },
          });
        }

        const newValue = Number(targetValue);
        const oldValue = Number(allocation.targetValue);
        const childrenTarget = Number(allocation.childrenTarget);
        const valueDiff = newValue - oldValue;

        if (newValue < childrenTarget) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `New value (${newValue}) is less than children total (${childrenTarget})` },
          });
        }

        if (allocation.parentId && allocation.parent) {
          const parentValue = Number(allocation.parent.targetValue);
          const parentChildren = Number(allocation.parent.childrenTarget);
          const parentRemaining = parentValue - parentChildren + oldValue;

          if (newValue > parentRemaining) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: `New value (${newValue}) exceeds parent remaining (${parentRemaining})` },
            });
          }

          await prisma.targetAllocation.update({
            where: { id: allocation.parentId },
            data: { childrenTarget: { increment: valueDiff } },
          });
        } else {
          const otherRootTotal = await prisma.targetAllocation.aggregate({
            where: { targetId, parentId: null, id: { not: allocId } },
            _sum: { targetValue: true },
          });
          const otherTotal = Number(otherRootTotal._sum.targetValue || 0);

          if (otherTotal + newValue > Number(allocation.target.totalTarget)) {
            return res.status(422).json({
              success: false,
              error: { code: 'INSUFFICIENT_FUND', message: `Total root allocations exceed target total` },
            });
          }
        }

        updateData.targetValue = newValue;
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
        where: { id: allocId },
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
      if (allocation.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Can only delete DRAFT allocations' },
        });
      }
      if (allocation.children.length > 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Cannot delete allocation with children' },
        });
      }

      if (allocation.parentId) {
        await prisma.targetAllocation.update({
          where: { id: allocation.parentId },
          data: { childrenTarget: { decrement: Number(allocation.targetValue) } },
        });
      }

      await prisma.targetAllocation.delete({ where: { id: allocId } });
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
    console.error('Target allocation detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
