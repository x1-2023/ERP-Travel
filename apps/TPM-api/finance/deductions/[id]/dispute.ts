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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing deduction ID' });
  }

  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Missing required field: reason' });
    }

    // Get the deduction
    const deduction = await prisma.deduction.findUnique({ where: { id } });

    if (!deduction) {
      return res.status(404).json({ error: 'Deduction not found' });
    }

    if (deduction.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only dispute pending deductions' });
    }

    // Update deduction to disputed
    const updated = await prisma.deduction.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        reasonDescription: reason,
      },
      include: {
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        amount: Number(updated.amount),
      },
      message: 'Deduction disputed successfully',
    });
  } catch (error) {
    console.error('Dispute deduction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
