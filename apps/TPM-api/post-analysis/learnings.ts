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

    const analyses = await prisma.postPromotionAnalysis.findMany({
      where: { companyId: userRecord.companyId },
      select: {
        id: true,
        promotionId: true,
        result: true,
        keyFindings: true,
        recommendations: true,
        lessonsLearned: true,
        roi: true,
        upliftPercent: true,
        promotion: { select: { code: true, name: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    // Aggregate learnings
    const allFindings: Array<{ source: string; finding: string }> = [];
    const allRecommendations: Array<{ source: string; recommendation: string }> = [];
    const allLessons: Array<{ source: string; lesson: string }> = [];

    for (const a of analyses) {
      const source = `${a.promotion.code} - ${a.promotion.name}`;
      if (Array.isArray(a.keyFindings)) {
        for (const f of a.keyFindings as string[]) {
          allFindings.push({ source, finding: f });
        }
      }
      if (Array.isArray(a.recommendations)) {
        for (const r of a.recommendations as string[]) {
          allRecommendations.push({ source, recommendation: r });
        }
      }
      if (Array.isArray(a.lessonsLearned)) {
        for (const l of a.lessonsLearned as string[]) {
          allLessons.push({ source, lesson: l });
        }
      }
    }

    return res.status(200).json({
      data: {
        totalAnalyses: analyses.length,
        findings: allFindings.slice(0, 20),
        recommendations: allRecommendations.slice(0, 20),
        lessons: allLessons.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Post analysis learnings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
