import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';
import { checkVersion, OptimisticLockError } from '../_lib/optimistic-lock';

// Sprint 0+1: RBAC + Optimistic Locking + Standard errors
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    if (req.method === 'GET') {
      const target = await prisma.target.findUnique({
        where: { id },
        include: {
          allocations: { include: { geographicUnit: true } },
          _count: { select: { allocations: true } },
        },
      });

      if (!target) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
      }

      const progressPercent = Number(target.totalTarget) > 0
        ? (Number(target.totalAchieved) / Number(target.totalTarget)) * 100
        : 0;

      return res.status(200).json({ success: true, data: { ...target, progressPercent } });
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

      const existing = await prisma.target.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
      }

      // Check for conflicts
      checkVersion(existing.updatedAt, clientUpdatedAt, 'Target', id);

      const updateData: Record<string, unknown> = {};
      if (bodyFields.name !== undefined) updateData.name = bodyFields.name;
      if (bodyFields.description !== undefined) updateData.description = bodyFields.description;
      if (bodyFields.totalTarget !== undefined) updateData.totalTarget = Number(bodyFields.totalTarget);
      if (bodyFields.status !== undefined) updateData.status = bodyFields.status;
      if (bodyFields.isActive !== undefined) updateData.isActive = bodyFields.isActive;

      if (bodyFields.metric !== undefined) {
        const validMetrics = ['CASES', 'VOLUME_LITERS', 'REVENUE_VND', 'UNITS'];
        if (!validMetrics.includes(bodyFields.metric)) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid metric type' },
          });
        }
        updateData.metric = bodyFields.metric;
      }

      const updated = await prisma.target.update({ where: { id }, data: updateData });
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.target.findUnique({
        where: { id },
        include: { _count: { select: { allocations: true } } },
      });
      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
      }
      if (existing.status !== 'DRAFT') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Can only delete DRAFT targets' },
        });
      }

      await prisma.targetAllocation.deleteMany({ where: { targetId: id } });
      await prisma.target.delete({ where: { id } });
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
          details: { entityType: error.entityType, entityId: error.entityId, yourVersion: error.expectedVersion, currentVersion: error.actualVersion },
        },
      });
    }
    console.error('Target error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
