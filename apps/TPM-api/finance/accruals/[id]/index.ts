import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing accrual ID' });
  }

  try {
    if (req.method === 'GET') {
      const accrual = await prisma.accrualEntry.findUnique({
        where: { id },
        include: {
          promotion: {
            select: {
              id: true,
              code: true,
              name: true,
              budget: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });

      if (!accrual) {
        return res.status(404).json({ error: 'Accrual not found' });
      }

      // Get GL journal if posted
      let glJournal = null;
      if (accrual.glJournalId) {
        glJournal = await prisma.gLJournal.findUnique({
          where: { id: accrual.glJournalId },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...accrual,
          amount: Number(accrual.amount),
          glJournal,
        },
      });
    }

    if (req.method === 'PUT') {
      // Only allow updates for PENDING or CALCULATED status
      const existing = await prisma.accrualEntry.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Accrual not found' });
      }

      if (existing.status !== 'PENDING') {
        return res.status(400).json({ error: 'Can only update pending accruals' });
      }

      const { amount, notes } = req.body;
      const updateData: Record<string, unknown> = {};

      if (amount !== undefined) {
        updateData.amount = parseFloat(amount);
      }
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const updated = await prisma.accrualEntry.update({
        where: { id },
        data: updateData,
        include: {
          promotion: { select: { id: true, code: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          ...updated,
          amount: Number(updated.amount),
        },
      });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.accrualEntry.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Accrual not found' });
      }

      if (existing.status === 'POSTED') {
        return res.status(400).json({ error: 'Cannot delete posted accruals. Reverse them first.' });
      }

      await prisma.accrualEntry.delete({ where: { id } });

      return res.status(200).json({ success: true, message: 'Accrual deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Accrual detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
