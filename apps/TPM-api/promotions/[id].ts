import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';
import { checkVersion, OptimisticLockError } from '../_lib/optimistic-lock';

// Sprint 1: RBAC + Optimistic Locking + Status Transition Validation
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    if (req.method === 'GET') {
      const promotion = await prisma.promotion.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, channel: true, code: true } },
          fund: { select: { id: true, name: true, code: true, type: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          tactics: {
            include: {
              items: { include: { product: { select: { id: true, name: true, sku: true } } } },
            },
          },
          claims: {
            select: { id: true, code: true, amount: true, status: true, claimDate: true },
            orderBy: { claimDate: 'desc' },
          },
        },
      });

      if (!promotion) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } });
      }
      return res.status(200).json({ success: true, data: promotion });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { updatedAt: clientUpdatedAt, status: newStatus, ...updateFields } = req.body;

      // Sprint 1 Fix 1: Require version for updates
      if (!clientUpdatedAt) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_VERSION',
            message: 'updatedAt is required for updates. Refetch the entity and try again.',
          },
        });
      }

      // Fetch current state
      const current = await prisma.promotion.findUnique({
        where: { id },
        select: { updatedAt: true, status: true },
      });

      if (!current) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } });
      }

      // Sprint 1 Fix 1: Check for conflicts
      checkVersion(current.updatedAt, clientUpdatedAt, 'Promotion', id);

      // Sprint 1 Fix 3: Status transition validation
      if (newStatus && newStatus !== current.status) {
        const { validatePromotionTransition, InvalidStatusTransitionError } = await import('../_lib/status-transitions');
        try {
          validatePromotionTransition(current.status, newStatus);
        } catch (err) {
          if (err instanceof InvalidStatusTransitionError) {
            return res.status(400).json({
              success: false,
              error: {
                code: 'INVALID_STATUS_TRANSITION',
                message: err.message,
                details: {
                  currentStatus: err.currentStatus,
                  requestedStatus: err.requestedStatus,
                  allowedStatuses: err.allowedStatuses,
                },
              },
            });
          }
          throw err;
        }
      }

      // Build update data
      const data: Record<string, unknown> = {};
      if (updateFields.name !== undefined) data.name = updateFields.name;
      if (updateFields.description !== undefined) data.description = updateFields.description;
      if (updateFields.startDate) data.startDate = new Date(updateFields.startDate);
      if (updateFields.endDate) data.endDate = new Date(updateFields.endDate);
      if (updateFields.budget !== undefined) data.budget = updateFields.budget;
      if (newStatus) data.status = newStatus;

      const promotion = await prisma.promotion.update({
        where: { id },
        data,
      });

      return res.status(200).json({ success: true, data: promotion });
    }

    if (req.method === 'DELETE') {
      await prisma.promotion.delete({ where: { id } });
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
    console.error('Promotion detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
