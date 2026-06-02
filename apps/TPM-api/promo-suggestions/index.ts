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

  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!userRecord) return res.status(404).json({ error: 'User not found' });

    if (req.method === 'GET') {
      const { page = '1', limit = '20', status, type, customerId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = { companyId: userRecord.companyId };
      if (status) where.status = status;
      if (type) where.type = type;
      if (customerId) where.customerId = customerId;

      const [suggestions, total] = await Promise.all([
        prisma.promoSuggestion.findMany({
          where,
          skip,
          take,
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          include: {
            customer: { select: { id: true, name: true, code: true } },
          },
        }),
        prisma.promoSuggestion.count({ where }),
      ]);

      return res.status(200).json({
        data: suggestions,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      // Generate AI suggestion (simplified - in production, call ML service)
      const { customerId, contractId, type: suggestionType } = req.body;

      const suggestion = await prisma.promoSuggestion.create({
        data: {
          companyId: userRecord.companyId,
          customerId: customerId || null,
          contractId: contractId || null,
          type: suggestionType || 'PROMOTION',
          status: 'PENDING',
          priority: 5,
          title: 'AI Generated Suggestion',
          description: 'Suggestion generated based on historical data and current performance metrics.',
          rationale: 'Automated analysis of sales patterns, seasonality, and contract targets.',
          confidence: 0.75,
          modelVersion: 'pepsi-suggest-v3.1',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: {
          customer: { select: { id: true, name: true, code: true } },
        },
      });

      return res.status(201).json({ data: suggestion });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Promo suggestions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
