import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * GET /budgets/years
 * Get distinct budget years for filter dropdowns
 * Sprint 0+1: RBAC + Standard errors
 */
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  try {
    const budgets = await prisma.budget.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    const years = budgets.map(b => b.year);

    return res.status(200).json({ success: true, data: years });
  } catch (error) {
    console.error('Budget years error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
