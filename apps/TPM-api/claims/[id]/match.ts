import type { VercelResponse } from '@vercel/node';
import { financePlus, type AuthenticatedRequest } from '../../_lib/auth';
import { runAIMatching } from '../../_lib/claims-service';

// POST /api/claims/:id/match - Run AI promotion matching
export default financePlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  const { id } = req.query as { id: string };
  if (!id) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing id' } });

  try {
    const matches = await runAIMatching(id, req.auth.userId);
    return res.status(200).json({ success: true, data: matches });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    if (msg.includes('not found')) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: msg } });
    console.error('Match claim error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: msg } });
  }
});
