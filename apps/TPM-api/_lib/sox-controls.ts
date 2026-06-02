/**
 * Sprint 1 Fix 2: SOX Separation of Duties
 * SOX Compliance: Creator of a request CANNOT approve/reject their own request.
 */

import type { VercelResponse } from '@vercel/node';
import prisma from './prisma';
import type { AuthenticatedRequest } from './auth';

interface SOXCheckOptions {
  entityType: 'promotion' | 'budget' | 'claim';
  action: 'approve' | 'reject' | 'review';
  getEntityId: (req: AuthenticatedRequest) => string;
  getCreatorField?: string;
}

export class SOXViolationError extends Error {
  constructor(
    public entityType: string,
    public action: string,
    public userId: string
  ) {
    super(
      `SOX Compliance: You cannot ${action} a ${entityType} that you created.`
    );
    this.name = 'SOXViolationError';
  }
}

export function soxSeparationOfDuties(options: SOXCheckOptions) {
  return function (handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void | VercelResponse>) {
    return async (req: AuthenticatedRequest, res: VercelResponse) => {
      const entityId = options.getEntityId(req);
      const userId = req.auth.userId;
      const creatorField = options.getCreatorField || 'createdById';

      // Fetch entity to check creator
      const entity = await (prisma as Record<string, any>)[options.entityType].findUnique({
        where: { id: entityId },
        select: { [creatorField]: true, id: true },
      });

      if (!entity) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `${options.entityType} not found` },
        });
      }

      // SOX CHECK: Creator cannot approve their own request
      if (entity[creatorField] === userId) {
        // Log SOX violation attempt
        try {
          // Find or create a SOX control for separation of duties
          let control = await prisma.sOXControl.findFirst({
            where: { code: 'SOD-001' },
          });

          if (control) {
            await prisma.sOXViolation.create({
              data: {
                companyId: req.auth.companyId,
                controlId: control.id,
                userId,
                action: options.action,
                entityType: options.entityType,
                entityId,
                details: {
                  violationType: 'SELF_APPROVAL_ATTEMPT',
                  description: `User ${userId} attempted to ${options.action} their own ${options.entityType} ${entityId}`,
                },
                wasBlocked: true,
              },
            });
          }
        } catch {
          // Don't block the response if audit logging fails
        }

        return res.status(403).json({
          success: false,
          error: {
            code: 'SOX_VIOLATION',
            message: `SOX Compliance: You cannot ${options.action} a ${options.entityType} that you created.`,
            details: {
              control: 'Separation of Duties',
              requirement: 'Creator and approver must be different persons',
            },
          },
        });
      }

      return handler(req, res);
    };
  };
}

// Convenience wrappers
export const promotionApprovalSOX = soxSeparationOfDuties({
  entityType: 'promotion',
  action: 'approve',
  getEntityId: (req) => req.query.id as string,
  getCreatorField: 'createdById',
});

export const budgetApprovalSOX = soxSeparationOfDuties({
  entityType: 'budget',
  action: 'approve',
  getEntityId: (req) => req.query.id as string,
  getCreatorField: 'createdBy',
});

export const claimApprovalSOX = soxSeparationOfDuties({
  entityType: 'claim',
  action: 'approve',
  getEntityId: (req) => req.query.id as string,
  getCreatorField: 'createdBy',
});
