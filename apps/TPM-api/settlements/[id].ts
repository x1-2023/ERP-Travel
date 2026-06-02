import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { financePlus, type AuthenticatedRequest } from '../_lib/auth';

// GET/PUT /api/settlements/:id - Settlement detail
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    if (req.method === 'GET') {
      const settlement = await prisma.settlement.findUnique({
        where: { id },
        include: {
          claim: {
            select: {
              id: true, code: true, amount: true, status: true, claimedAmount: true, approvedAmount: true,
              customer: { select: { id: true, name: true, code: true } },
              promotion: { select: { id: true, code: true, name: true } },
            },
          },
          batch: { select: { id: true, code: true, status: true } },
        },
      });

      if (!settlement) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Settlement not found' } });
      }
      return res.status(200).json({ success: true, data: settlement });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { notes, paymentMethod } = req.body;

      const settlement = await prisma.settlement.findUnique({ where: { id }, select: { status: true } });
      if (!settlement) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Settlement not found' } });
      }
      if (settlement.status === 'PAID') {
        return res.status(422).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Cannot update a PAID settlement' },
        });
      }

      const data: Record<string, unknown> = {};
      if (notes !== undefined) data.notes = notes;
      if (paymentMethod) data.paymentMethod = paymentMethod;

      const updated = await prisma.settlement.update({ where: { id }, data });
      return res.status(200).json({ success: true, data: updated });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Settlement detail error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
