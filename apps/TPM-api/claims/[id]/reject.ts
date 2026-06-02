import type { VercelResponse } from '@vercel/node';
import { financePlus, type AuthenticatedRequest } from '../../_lib/auth';
import { rejectClaim } from '../../_lib/claims-service';

// POST /api/claims/:id/reject - Reject claim with reason
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'reason is required' },
    });
  }

  try {
    const result = await rejectClaim(id, reason, req.auth.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
    if (msg.includes('Invalid status')) return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS_TRANSITION', message: msg } });
    console.error('Reject claim error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: msg } });
  }
});
