import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

/**
 * POST /budgets/:id/submit
 * Submit a budget for approval (Aforza-style multi-level workflow)
 *
 * Approval Levels:
 * - Level 1: KAM Manager (< 100M VND)
 * - Level 2: Trade Marketing Manager (100M - 500M VND)
 * - Level 3: Finance Director (> 500M VND)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing budget id' });

  try {
    // Get budget
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { approvals: { orderBy: { submittedAt: 'desc' }, take: 1 } },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Validate: Can only submit DRAFT or REVISION_NEEDED budgets
    if (budget.approvalStatus !== 'DRAFT' && budget.approvalStatus !== 'REVISION_NEEDED') {
      return res.status(400).json({
        error: `Cannot submit budget with status "${budget.approvalStatus}". Only DRAFT or REVISION_NEEDED budgets can be submitted.`
      });
    }

    // Get submitter info
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    const submitterName = userRecord?.name || 'Unknown User';

    // Determine role for first approval level
    const roleMap: Record<number, string> = {
      1: 'KAM Manager',
      2: 'Trade Marketing Manager',
      3: 'Finance Director',
    };

    // Create approval record for level 1
    const approval = await prisma.budgetApproval.create({
      data: {
        budgetId: id,
        level: 1,
        role: roleMap[1],
        status: 'UNDER_REVIEW',
        submittedAt: new Date(),
      },
    });

    // Update budget status
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        approvalStatus: 'SUBMITTED',
        currentLevel: 1,
      },
      include: {
        approvals: { orderBy: { submittedAt: 'desc' } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Budget submitted for approval. Awaiting review from ${roleMap[1]}.`,
      data: {
        ...updatedBudget,
        totalAmount: Number(updatedBudget.totalAmount),
        allocatedAmount: Number(updatedBudget.allocatedAmount),
        spentAmount: Number(updatedBudget.spentAmount),
        workflow: {
          currentLevel: 1,
          requiredLevels: updatedBudget.approvalLevel,
          currentRole: roleMap[1],
          nextRole: updatedBudget.approvalLevel > 1 ? roleMap[2] : null,
        },
      },
    });
  } catch (error) {
    console.error('Submit budget error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
