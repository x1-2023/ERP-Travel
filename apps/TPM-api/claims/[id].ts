import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';
import { checkVersion, OptimisticLockError } from '../_lib/optimistic-lock';

// Phase 6: Enhanced Claim detail with full relations
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    if (req.method === 'GET') {
      const claim = await prisma.claim.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, name: true, channel: true, code: true } },
          promotion: { select: { id: true, code: true, name: true, status: true, budget: true, startDate: true, endDate: true } },
          reviewedBy: { select: { id: true, name: true, email: true } },
          lineItems: { orderBy: { createdAt: 'asc' } },
          claimDocuments: { orderBy: { uploadedAt: 'desc' } },
          promotionMatches: {
            orderBy: { confidenceScore: 'desc' },
            include: {
              promotion: { select: { id: true, code: true, name: true, budget: true } },
            },
          },
          approvals: { orderBy: { createdAt: 'desc' } },
          auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
          settlements: { orderBy: { createdAt: 'desc' } },
          transactions: { orderBy: { createdAt: 'desc' } },
          _count: { select: { lineItems: true, settlements: true, approvals: true, auditLogs: true } },
        },
      });

      if (!claim) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } });
      }
      return res.status(200).json({ success: true, data: claim });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { updatedAt: clientUpdatedAt, status: newStatus, ...updateFields } = req.body;

      if (!clientUpdatedAt) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_VERSION',
            message: 'updatedAt is required for updates. Refetch the entity and try again.',
          },
        });
      }

      const current = await prisma.claim.findUnique({
        where: { id },
        select: { updatedAt: true, status: true },
      });

      if (!current) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } });
      }

      checkVersion(current.updatedAt, clientUpdatedAt, 'Claim', id);

      if (newStatus && newStatus !== current.status) {
        const { validateClaimTransition, InvalidStatusTransitionError } = await import('../_lib/status-transitions');
        try {
          validateClaimTransition(current.status, newStatus);
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

      const data: Record<string, unknown> = {};
      if (newStatus) data.status = newStatus;
      if (updateFields.amount !== undefined) data.amount = updateFields.amount;
      if (updateFields.claimedAmount !== undefined) data.claimedAmount = updateFields.claimedAmount;
      if (updateFields.description !== undefined) data.description = updateFields.description;
      if (updateFields.reviewedById) data.reviewedById = updateFields.reviewedById;
      if (updateFields.type !== undefined) data.type = updateFields.type;
      if (updateFields.source !== undefined) data.source = updateFields.source;
      if (updateFields.invoiceNumber !== undefined) data.invoiceNumber = updateFields.invoiceNumber;
      if (updateFields.invoiceDate !== undefined) data.invoiceDate = updateFields.invoiceDate ? new Date(updateFields.invoiceDate) : null;
      if (updateFields.invoiceAmount !== undefined) data.invoiceAmount = updateFields.invoiceAmount;
      if (updateFields.dueDate !== undefined) data.dueDate = updateFields.dueDate ? new Date(updateFields.dueDate) : null;
      if (updateFields.priority !== undefined) data.priority = updateFields.priority;
      if (updateFields.internalNotes !== undefined) data.internalNotes = updateFields.internalNotes;
      if (updateFields.customerNotes !== undefined) data.customerNotes = updateFields.customerNotes;
      if (updateFields.promotionId !== undefined) data.promotionId = updateFields.promotionId || null;

      const claim = await prisma.claim.update({
        where: { id },
        data,
      });

      return res.status(200).json({ success: true, data: claim });
    }

    if (req.method === 'DELETE') {
      const claim = await prisma.claim.findUnique({ where: { id }, select: { status: true } });
      if (!claim) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Claim not found' } });
      }
      if (claim.status !== 'DRAFT' && claim.status !== 'CANCELLED') {
        return res.status(422).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Only DRAFT or CANCELLED claims can be deleted' },
        });
      }

      await prisma.claim.delete({ where: { id } });
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
    console.error('Claim detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
