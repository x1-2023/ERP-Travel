import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * GET /budgets/:id/approval-history
 * Get the complete approval audit trail for a budget
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing budget id' });

  try {
    // Get budget with approval history
    const budget = await prisma.budget.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        totalAmount: true,
        approvalStatus: true,
        approvalLevel: true,
        currentLevel: true,
        approvals: {
          orderBy: { submittedAt: 'asc' },
        },
      },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const roleMap: Record<number, string> = {
      1: 'KAM Manager',
      2: 'Trade Marketing Manager',
      3: 'Finance Director',
    };

    // Build workflow timeline
    const timeline = budget.approvals.map((approval, index) => ({
      id: approval.id,
      step: index + 1,
      level: approval.level,
      role: approval.role,
      status: approval.status,
      reviewer: approval.reviewerName || null,
      comments: approval.comments || null,
      submittedAt: approval.submittedAt,
      reviewedAt: approval.reviewedAt || null,
      duration: approval.reviewedAt
        ? Math.round((approval.reviewedAt.getTime() - approval.submittedAt.getTime()) / (1000 * 60 * 60)) // hours
        : null,
    }));

    // Calculate summary stats
    const approvedCount = timeline.filter(t => t.status === 'APPROVED').length;
    const pendingCount = timeline.filter(t => t.status === 'UNDER_REVIEW').length;
    const rejectedCount = timeline.filter(t => t.status === 'REJECTED').length;

    // Calculate average review time (in hours)
    const completedReviews = timeline.filter(t => t.duration !== null);
    const avgReviewTime = completedReviews.length > 0
      ? Math.round(completedReviews.reduce((sum, t) => sum + (t.duration || 0), 0) / completedReviews.length)
      : null;

    return res.status(200).json({
      data: {
        budget: {
          id: budget.id,
          code: budget.code,
          name: budget.name,
          totalAmount: Number(budget.totalAmount),
        },
        workflow: {
          status: budget.approvalStatus,
          currentLevel: budget.currentLevel,
          requiredLevels: budget.approvalLevel,
          progress: budget.approvalLevel > 0
            ? Math.round((approvedCount / budget.approvalLevel) * 100)
            : 0,
          levels: Array.from({ length: budget.approvalLevel }, (_, i) => ({
            level: i + 1,
            role: roleMap[i + 1],
            status: i + 1 < budget.currentLevel
              ? 'APPROVED'
              : i + 1 === budget.currentLevel
                ? (budget.approvalStatus === 'APPROVED' ? 'APPROVED' : 'UNDER_REVIEW')
                : 'PENDING',
          })),
        },
        timeline,
        summary: {
          totalSteps: timeline.length,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
          avgReviewTimeHours: avgReviewTime,
        },
      },
    });
  } catch (error) {
    console.error('Approval history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
