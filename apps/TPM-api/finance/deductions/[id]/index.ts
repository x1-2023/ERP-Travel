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
    return res.status(400).json({ error: 'Missing deduction ID' });
  }

  try {
    if (req.method === 'GET') {
      const deduction = await prisma.deduction.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              name: true,
              channel: true,
            },
          },
          matchedClaim: {
            select: {
              id: true,
              code: true,
              amount: true,
              status: true,
              claimDate: true,
              promotion: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!deduction) {
        return res.status(404).json({ error: 'Deduction not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...deduction,
          amount: Number(deduction.amount),
        },
      });
    }

    if (req.method === 'PUT') {
      // Only allow updates for OPEN status
      const existing = await prisma.deduction.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Deduction not found' });
      }

      if (existing.status !== 'PENDING') {
        return res.status(400).json({ error: 'Can only update open deductions' });
      }

      const { amount, reasonDescription, sourceDocument, sourceDate } = req.body;
      const updateData: Record<string, unknown> = {};

      if (amount !== undefined) {
        updateData.amount = parseFloat(amount);
      }
      if (reasonDescription !== undefined) {
        updateData.reasonDescription = reasonDescription;
      }
      if (sourceDocument !== undefined) {
        updateData.sourceDocument = sourceDocument;
      }
      if (sourceDate !== undefined) {
        updateData.sourceDate = new Date(sourceDate);
      }

      const updated = await prisma.deduction.update({
        where: { id },
        data: updateData,
        include: {
          customer: { select: { id: true, name: true, code: true } },
          matchedClaim: { select: { id: true, code: true } },
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
      const existing = await prisma.deduction.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Deduction not found' });
      }

      if (existing.status !== 'PENDING') {
        return res.status(400).json({ error: 'Can only delete open deductions' });
      }

      await prisma.deduction.delete({ where: { id } });

      return res.status(200).json({ success: true, message: 'Deduction deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Deduction detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
