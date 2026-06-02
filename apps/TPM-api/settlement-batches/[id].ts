import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { financePlus, type AuthenticatedRequest } from '../_lib/auth';

// GET /api/settlement-batches/:id - Batch detail
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const batch = await prisma.settlementBatch.findUnique({
      where: { id },
      include: {
        settlements: {
          orderBy: { createdAt: 'desc' },
          include: {
            claim: {
              select: {
                id: true, code: true, amount: true, status: true,
                customer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!batch) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found' } });
    }
    return res.status(200).json({ success: true, data: batch });
  } catch (error) {
    console.error('Settlement batch detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
