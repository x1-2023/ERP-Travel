/**
 * Sprint 0 Fix 8: Logout Endpoint
 * POST /api/auth/logout - Revoke current token
 */

import type { VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { withAuth, type AuthenticatedRequest } from '../_lib/auth';
import { revokeToken } from '../_lib/tokenBlacklist';

export default withAuth(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.token;
    if (!token) {
      return res.status(400).json({ success: false, error: 'No token to revoke' });
    }

    // Decode to get expiry
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await revokeToken(token, req.auth.userId, 'logout', expiresAt);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
});
