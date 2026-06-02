import type { VercelResponse } from '@vercel/node';
import { financePlus, type AuthenticatedRequest } from '../../_lib/auth';
import { approveClaim } from '../../_lib/claims-service';

// POST /api/claims/:id/approve - Approve claim with amount
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  const { approvedAmount, comments } = req.body;
  if (approvedAmount === undefined || approvedAmount === null) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'approvedAmount is required' },
    });
  }

  const parsedAmount = Number(approvedAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'approvedAmount must be a positive number' },
    });
  }

  try {
    // SOX check: ensure approver is not the claim creator
    const prisma = (await import('../../_lib/prisma')).default;
    const claim = await prisma.claim.findUnique({ where: { id }, select: { createdBy: true } });
    if (claim?.createdBy === req.auth.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SOX_VIOLATION',
          message: 'SOX Compliance: You cannot approve a claim that you created.',
          details: { control: 'Separation of Duties' },
        },
      });
    }

    const result = await approveClaim(id, parsedAmount, comments, req.auth.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
    if (msg.includes('Invalid status')) return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS_TRANSITION', message: msg } });
    console.error('Approve claim error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: msg } });
  }
});
