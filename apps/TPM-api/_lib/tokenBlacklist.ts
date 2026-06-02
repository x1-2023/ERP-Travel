/**
 * Sprint 0 Fix 8: Token Blacklist Service
 * Allows revoking JWT tokens on logout, password change, etc.
 */

import { createHash } from 'crypto';
import prisma from './prisma';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function revokeToken(
  token: string,
  userId: string,
  reason: 'logout' | 'password_change' | 'admin_revoke' | 'security_incident',
  expiresAt: Date
): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.tokenBlacklist.upsert({
    where: { tokenHash },
    create: { tokenHash, userId, reason, expiresAt },
    update: { reason },
  });
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const entry = await prisma.tokenBlacklist.findUnique({
    where: { tokenHash },
  });
  return !!entry;
}

export async function revokeAllUserTokens(
  userId: string,
  reason: 'password_change' | 'admin_revoke' | 'security_incident'
): Promise<void> {
  const tokenHash = hashToken(`ALL_TOKENS_${userId}_${Date.now()}`);
  await prisma.tokenBlacklist.create({
    data: {
      tokenHash,
      userId,
      reason,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}

// Cleanup expired entries - call as a cron job
export async function cleanupExpiredBlacklist(): Promise<number> {
  const result = await prisma.tokenBlacklist.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
