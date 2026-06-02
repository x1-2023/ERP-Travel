import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { managerPlus, type AuthenticatedRequest } from '../../_lib/auth';

/**
 * POST /budgets/:id/review
 * Review a budget (approve, reject, or request revision)
 * Sprint 1: RBAC + SOX separation of duties
 */
export default managerPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing budget id' } });

  const { action, comments } = req.body;

  if (!action || !['approve', 'reject', 'revision_needed'].includes(action)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid action. Must be "approve", "reject", or "revision_needed"' },
    });
  }

  if ((action === 'reject' || action === 'revision_needed') && !comments) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Comments are required when rejecting or requesting revision' },
    });
  }

  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { approvals: { orderBy: { submittedAt: 'desc' }, take: 1 } },
    });

    if (!budget) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    // Sprint 1 Fix 2: SOX Separation of Duties
    if (budget.createdBy === req.auth.userId) {
      // Log SOX violation attempt
      try {
        const control = await prisma.sOXControl.findFirst({ where: { code: 'SOD-001' } });
        if (control) {
          await prisma.sOXViolation.create({
            data: {
              companyId: req.auth.companyId,
              controlId: control.id,
              userId: req.auth.userId,
              action,
              entityType: 'budget',
              entityId: id,
              details: {
                violationType: 'SELF_APPROVAL_ATTEMPT',
                description: `User attempted to ${action} their own budget ${budget.code}`,
              },
              wasBlocked: true,
            },
          });
        }
      } catch {
        // Don't block if audit logging fails
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'SOX_VIOLATION',
          message: `SOX Compliance: You cannot ${action} a budget that you created.`,
          details: {
            control: 'Separation of Duties',
            requirement: 'Creator and approver must be different persons',
          },
        },
      });
    }

    // Validate status
    if (budget.approvalStatus !== 'SUBMITTED' && budget.approvalStatus !== 'UNDER_REVIEW') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS_TRANSITION', message: `Cannot review budget with status "${budget.approvalStatus}". Must be SUBMITTED or UNDER_REVIEW.` },
      });
    }

    const currentApproval = budget.approvals[0];
    if (!currentApproval || currentApproval.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No pending approval found for this budget' } });
    }

    const userRecord = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    const reviewerName = userRecord?.name || 'Unknown User';

    const roleMap: Record<number, string> = {
      1: 'KAM Manager',
      2: 'Trade Marketing Manager',
      3: 'Finance Director',
    };

    const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED'> = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      revision_needed: 'REVISION_NEEDED',
    };

    await prisma.budgetApproval.update({
      where: { id: currentApproval.id },
      data: {
        status: statusMap[action],
        reviewerId: req.auth.userId,
        reviewerName,
        comments,
        reviewedAt: new Date(),
      },
    });

    let updatedBudget;
    let message: string;

    if (action === 'approve') {
      const nextLevel = currentApproval.level + 1;
      if (nextLevel <= budget.approvalLevel) {
        await prisma.budgetApproval.create({
          data: {
            budgetId: id,
            level: nextLevel,
            role: roleMap[nextLevel],
            status: 'UNDER_REVIEW',
            submittedAt: new Date(),
          },
        });
        updatedBudget = await prisma.budget.update({
          where: { id },
          data: { approvalStatus: 'UNDER_REVIEW', currentLevel: nextLevel },
          include: { approvals: { orderBy: { submittedAt: 'desc' } } },
        });
        message = `Level ${currentApproval.level} approved by ${reviewerName}. Awaiting review from ${roleMap[nextLevel]}.`;
      } else {
        updatedBudget = await prisma.budget.update({
          where: { id },
          data: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
          include: { approvals: { orderBy: { submittedAt: 'desc' } } },
        });
        message = `Budget fully approved! All ${budget.approvalLevel} level(s) completed.`;
      }
    } else if (action === 'reject') {
      updatedBudget = await prisma.budget.update({
        where: { id },
        data: { approvalStatus: 'REJECTED' },
        include: { approvals: { orderBy: { submittedAt: 'desc' } } },
      });
      message = `Budget rejected by ${reviewerName}. Reason: ${comments}`;
    } else {
      updatedBudget = await prisma.budget.update({
        where: { id },
        data: { approvalStatus: 'REVISION_NEEDED', currentLevel: 0 },
        include: { approvals: { orderBy: { submittedAt: 'desc' } } },
      });
      message = `Revision requested by ${reviewerName}. Please address: ${comments}`;
    }

    return res.status(200).json({
      success: true,
      message,
      data: {
        ...updatedBudget,
        totalAmount: Number(updatedBudget.totalAmount),
        allocatedAmount: Number(updatedBudget.allocatedAmount),
        spentAmount: Number(updatedBudget.spentAmount),
        workflow: {
          currentLevel: updatedBudget.currentLevel,
          requiredLevels: updatedBudget.approvalLevel,
          status: updatedBudget.approvalStatus,
        },
      },
    });
  } catch (error) {
    console.error('Review budget error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
