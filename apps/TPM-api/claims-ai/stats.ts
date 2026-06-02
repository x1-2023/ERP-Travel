import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!userRecord) return res.status(404).json({ error: 'User not found' });

    const [
      totalClaims,
      processedClaims,
      autoApproved,
      flagged,
      manualReview,
      rejected,
    ] = await Promise.all([
      prisma.claim.count({ where: { customer: { companyId: userRecord.companyId } } }),
      prisma.claimAIMatch.count(),
      prisma.claimAIMatch.count({ where: { recommendation: 'AUTO_APPROVE' } }),
      prisma.claimAIMatch.count({ where: { recommendation: 'APPROVE_WITH_FLAG' } }),
      prisma.claimAIMatch.count({ where: { recommendation: 'MANUAL_REVIEW' } }),
      prisma.claimAIMatch.count({ where: { recommendation: 'REJECT' } }),
    ]);

    const avgConfidence = await prisma.claimAIMatch.aggregate({
      _avg: { confidence: true },
    });

    return res.status(200).json({
      data: {
        totalClaims,
        processedClaims,
        unprocessedClaims: totalClaims - processedClaims,
        processingRate: totalClaims > 0 ? Math.round((processedClaims / totalClaims) * 100) : 0,
        recommendations: {
          autoApproved,
          flagged,
          manualReview,
          rejected,
        },
        averageConfidence: Math.round((avgConfidence._avg.confidence || 0) * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Claims AI stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
