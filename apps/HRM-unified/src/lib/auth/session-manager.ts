// lib/auth/session-manager.ts

/**
 * LAC VIET HR - Session Manager
 * Secure session management with Redis support
 */

import crypto from 'crypto';
import { SecurityConfig } from '@/config/security.config';

// ════════════════════════════════════════════════════════════════════════════════
// SESSION CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const SESSION_CONFIG = SecurityConfig.session;

// ════════════════════════════════════════════════════════════════════════════════
// SESSION INTERFACES
// ════════════════════════════════════════════════════════════════════════════════

export interface SessionFingerprint {
  userAgent: string;
  ip: string;
  acceptLanguage?: string;
}

export interface Session {
  id: string;
  userId: string;
  email: string;
  role: string;
  permissions: string[];

  // Timestamps
  createdAt: number;
  lastActivity: number;
  expiresAt: number;

  // Device fingerprint
  fingerprint: SessionFingerprint;

  // Token tracking
  refreshTokenId: string;

  // Status
  revoked: boolean;
  revokedAt?: number;
  revokedReason?: string;

  // Metadata
  metadata?: Record<string, unknown>;
}

export interface SessionStore {
  get(sessionId: string): Promise<Session | null>;
  set(session: Session): Promise<void>;
  delete(sessionId: string): Promise<void>;
  getUserSessions(userId: string): Promise<string[]>;
  addUserSession(userId: string, sessionId: string): Promise<void>;
  removeUserSession(userId: string, sessionId: string): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY SESSION STORE (for development)
// ════════════════════════════════════════════════════════════════════════════════

class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, Session>();
  private userSessions = new Map<string, Set<string>>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Cleanup expired sessions every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  async get(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) || null;
  }

  async set(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async delete(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.removeUserSession(session.userId, sessionId);
    }
    this.sessions.delete(sessionId);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const sessions = this.userSessions.get(userId);
    return sessions ? Array.from(sessions) : [];
  }

  async addUserSession(userId: string, sessionId: string): Promise<void> {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);
  }

  async removeUserSession(userId: string, sessionId: string): Promise<void> {
    this.userSessions.get(userId)?.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    Array.from(this.sessions.entries()).forEach(([id, session]) => {
      if (session.expiresAt < now || session.revoked) {
        this.sessions.delete(id);
        this.userSessions.get(session.userId)?.delete(id);
      }
    });
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.sessions.clear();
    this.userSessions.clear();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SESSION MANAGER CLASS
// ════════════════════════════════════════════════════════════════════════════════

export class SessionManager {
  private store: SessionStore;

  constructor(store?: SessionStore) {
    this.store = store || new InMemorySessionStore();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE SESSION
  // ─────────────────────────────────────────────────────────────────────────────

  async createSession(
    userId: string,
    userData: { email: string; role: string; permissions: string[] },
    fingerprint: SessionFingerprint,
    metadata?: Record<string, unknown>
  ): Promise<Session> {
    // Check and enforce session limit
    await this.enforceSessionLimit(userId);

    const now = Date.now();
    const sessionId = this.generateSessionId();

    const session: Session = {
      id: sessionId,
      userId,
      email: userData.email,
      role: userData.role,
      permissions: userData.permissions,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + SESSION_CONFIG.maxAge * 1000,
      fingerprint,
      refreshTokenId: crypto.randomUUID(),
      revoked: false,
      metadata,
    };

    // Save session
    await this.store.set(session);
    await this.store.addUserSession(userId, sessionId);

    return session;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET SESSION
  // ─────────────────────────────────────────────────────────────────────────────

  async getSession(sessionId: string): Promise<Session | null> {
    const session = await this.store.get(sessionId);

    if (!session) return null;
    if (session.revoked) return null;
    if (session.expiresAt < Date.now()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATE SESSION
  // ─────────────────────────────────────────────────────────────────────────────

  async validateSession(
    sessionId: string,
    fingerprint: SessionFingerprint
  ): Promise<{
    valid: boolean;
    session?: Session;
    error?: string;
    code?: 'NOT_FOUND' | 'REVOKED' | 'EXPIRED' | 'INACTIVE' | 'FINGERPRINT_MISMATCH';
  }> {
    const session = await this.store.get(sessionId);

    if (!session) {
      return { valid: false, error: 'Session not found', code: 'NOT_FOUND' };
    }

    if (session.revoked) {
      return { valid: false, error: 'Session revoked', code: 'REVOKED' };
    }

    const now = Date.now();

    if (session.expiresAt < now) {
      await this.deleteSession(sessionId);
      return { valid: false, error: 'Session expired', code: 'EXPIRED' };
    }

    // Check inactivity timeout
    const inactiveMs = now - session.lastActivity;
    if (inactiveMs > SESSION_CONFIG.inactivityTimeout * 1000) {
      await this.revokeSession(sessionId, 'INACTIVITY_TIMEOUT');
      return { valid: false, error: 'Session inactive', code: 'INACTIVE' };
    }

    // Validate fingerprint
    if (SESSION_CONFIG.validateFingerprint) {
      const fingerprintValid = this.validateFingerprint(session.fingerprint, fingerprint);
      if (!fingerprintValid.valid) {
        await this.revokeSession(sessionId, 'FINGERPRINT_MISMATCH');
        return {
          valid: false,
          error: fingerprintValid.error,
          code: 'FINGERPRINT_MISMATCH',
        };
      }
    }

    // Update last activity
    if (SESSION_CONFIG.extendOnActivity) {
      await this.updateActivity(sessionId);
    }

    return { valid: true, session };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATE FINGERPRINT
  // ─────────────────────────────────────────────────────────────────────────────

  private validateFingerprint(
    original: SessionFingerprint,
    current: SessionFingerprint
  ): { valid: boolean; error?: string } {
    // User agent must match (strict)
    if (original.userAgent !== current.userAgent) {
      return { valid: false, error: 'User agent mismatch' };
    }

    // IP change is logged but not rejected (users may change networks)
    // Could add stricter checks for sensitive operations

    return { valid: true };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE ACTIVITY
  // ─────────────────────────────────────────────────────────────────────────────

  async updateActivity(sessionId: string): Promise<void> {
    const session = await this.store.get(sessionId);
    if (!session || session.revoked) return;

    session.lastActivity = Date.now();
    await this.store.set(session);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REVOKE SESSION
  // ─────────────────────────────────────────────────────────────────────────────

  async revokeSession(sessionId: string, reason: string): Promise<void> {
    const session = await this.store.get(sessionId);
    if (!session) return;

    session.revoked = true;
    session.revokedAt = Date.now();
    session.revokedReason = reason;

    await this.store.set(session);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE SESSION
  // ─────────────────────────────────────────────────────────────────────────────

  async deleteSession(sessionId: string): Promise<void> {
    await this.store.delete(sessionId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REVOKE ALL USER SESSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async revokeAllUserSessions(userId: string, reason: string = 'USER_LOGOUT_ALL'): Promise<number> {
    const sessionIds = await this.store.getUserSessions(userId);

    for (const sessionId of sessionIds) {
      await this.revokeSession(sessionId, reason);
    }

    return sessionIds.length;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REVOKE OTHER SESSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const sessionIds = await this.store.getUserSessions(userId);
    let count = 0;

    for (const sessionId of sessionIds) {
      if (sessionId !== currentSessionId) {
        await this.revokeSession(sessionId, 'USER_REVOKED_OTHER_SESSIONS');
        count++;
      }
    }

    return count;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET USER SESSIONS
  // ─────────────────────────────────────────────────────────────────────────────

  async getUserSessions(userId: string): Promise<Session[]> {
    const sessionIds = await this.store.getUserSessions(userId);
    const sessions: Session[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    // Sort by last activity (most recent first)
    return sessions.sort((a, b) => b.lastActivity - a.lastActivity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENFORCE SESSION LIMIT
  // ─────────────────────────────────────────────────────────────────────────────

  private async enforceSessionLimit(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);

    // If at or over limit, revoke oldest session(s)
    if (sessions.length >= SESSION_CONFIG.maxConcurrent) {
      // Sort by last activity (oldest first)
      const sortedSessions = sessions.sort((a, b) => a.lastActivity - b.lastActivity);

      // Revoke oldest sessions until under limit
      const sessionsToRevoke = sortedSessions.slice(
        0,
        sessions.length - SESSION_CONFIG.maxConcurrent + 1
      );

      for (const session of sessionsToRevoke) {
        await this.revokeSession(session.id, 'MAX_SESSIONS_EXCEEDED');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private generateSessionId(): string {
    const randomBytes = crypto.randomBytes(32);
    return `sess_${randomBytes.toString('hex')}`;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════════════════════

let sessionManagerInstance: SessionManager | null = null;

export function getSessionManager(store?: SessionStore): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager(store);
  }
  return sessionManagerInstance;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Extract fingerprint from request
// ════════════════════════════════════════════════════════════════════════════════

export function extractFingerprint(request: Request): SessionFingerprint {
  return {
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown',
    acceptLanguage: request.headers.get('accept-language') || undefined,
  };
}
