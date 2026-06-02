import type { VercelResponse } from '@vercel/node';
import { financePlus, type AuthenticatedRequest } from '../../_lib/auth';
import { postSettlementToGL } from '../../_lib/settlement-service';

// POST /api/settlements/:id/post-gl - Post settlement to GL
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const result = await postSettlementToGL(id, req.auth.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
    if (msg.includes('already posted') || msg.includes('Cannot post')) {
      return res.status(422).json({ success: false, error: { code: 'INVALID_STATUS', message: msg } });
    }
    console.error('Post GL error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: msg } });
  }
});
