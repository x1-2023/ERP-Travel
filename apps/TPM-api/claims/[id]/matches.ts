import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../../_lib/auth';

// GET /api/claims/:id/matches - Get claim promotion matches
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const matches = await prisma.claimPromotionMatch.findMany({
      where: { claimId: id },
      orderBy: { confidenceScore: 'desc' },
      include: {
        promotion: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
            budget: true,
            startDate: true,
            endDate: true,
            customer: { select: { id: true, name: true } },
          },
        },
      },
    });

    return res.status(200).json({ success: true, data: matches });
  } catch (error) {
    console.error('Claim matches error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
