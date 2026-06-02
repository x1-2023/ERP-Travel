import type { VercelResponse } from '@vercel/node';
import { kamPlus, type AuthenticatedRequest } from '../../_lib/auth';
import { submitClaim } from '../../_lib/claims-service';

// POST /api/claims/:id/submit - Submit claim for validation
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const result = await submitClaim(id, req.auth.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
    if (msg.includes('Invalid status')) return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS_TRANSITION', message: msg } });
    console.error('Submit claim error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: msg } });
  }
});
