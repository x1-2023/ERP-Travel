import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '20', type, isRead, entityType, entityId } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {
        userId: user.userId,
        isDismissed: false,
      };
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead === 'true';
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;

      const [insights, total] = await Promise.all([
        prisma.aIInsight.findMany({
          where,
          skip,
          take,
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.aIInsight.count({ where }),
      ]);

      return res.status(200).json({
        data: insights,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { action, insightId } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Missing required field: action' });
      }

      switch (action) {
        case 'generate':
          // Placeholder for AI insight generation
          return res.status(200).json({
            data: {
              status: 'processing',
              message: 'AI insight generation initiated. Results will be available shortly.',
            },
          });

        case 'mark-read':
          if (!insightId) {
            return res.status(400).json({ error: 'Missing required field: insightId' });
          }
          await prisma.aIInsight.update({
            where: { id: insightId },
            data: { isRead: true },
          });
          return res.status(200).json({ data: { success: true } });

        case 'dismiss':
          if (!insightId) {
            return res.status(400).json({ error: 'Missing required field: insightId' });
          }
          await prisma.aIInsight.update({
            where: { id: insightId },
            data: { isDismissed: true },
          });
          return res.status(200).json({ data: { success: true } });

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('AI Insights error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
