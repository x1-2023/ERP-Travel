import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { adminOnly, parsePagination, type AuthenticatedRequest } from '../../_lib/auth';

// Sprint 0 Fix 3: ADMIN ONLY + Fix 5: Pagination cap
export default adminOnly(async (req: AuthenticatedRequest, res: VercelResponse) => {

  try {
    if (req.method === 'GET') {
      const { isActive } = req.query as Record<string, string>;
      const { skip, limit: take } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {};
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [webhooks, total] = await Promise.all([
        prisma.webhookSubscription.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { deliveries: true } },
          },
        }),
        prisma.webhookSubscription.count({ where }),
      ]);

      return res.status(200).json({
        data: webhooks,
        pagination: { limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { name, url, secret, events, headers, retryCount } = req.body;

      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Missing required fields: name, url, events (array)' });
      }

      const webhook = await prisma.webhookSubscription.create({
        data: {
          name,
          url,
          secret: secret || '',
          events,
          customHeaders: headers || null,
          maxRetries: retryCount ? parseInt(retryCount) : 3,
          createdById: req.auth.userId,
          companyId: req.auth.companyId || 'system',
        },
      });

      return res.status(201).json({ data: webhook });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Webhooks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
