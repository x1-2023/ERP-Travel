// lib/auth/account-lockout.ts

/**
 * LAC VIET HR - Account Lockout Manager
 * Progressive lockout to prevent brute force attacks
 */

import { SecurityConfig } from '@/config/security.config';

// ════════════════════════════════════════════════════════════════════════════════
// LOCKOUT CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

const LOCKOUT_CONFIG = SecurityConfig.lockout;

// ════════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ════════════════════════════════════════════════════════════════════════════════

export interface LockoutStatus {
  locked: boolean;
  remainingSeconds?: number;
  unlockAt?: Date;
  reason?: string;
  attempts?: number;
  maxAttempts?: number;
}

export interface AttemptResult {
  attemptCount: number;
  locked: boolean;
  lockoutDurationSeconds?: number;
  remainingAttempts: number;
}

export interface LockoutStore {
  // Attempt tracking
  getAttempts(identifier: string): Promise<number>;
  incrementAttempts(identifier: string, windowSeconds: number): Promise<number>;
  clearAttempts(identifier: string): Promise<void>;

  // Lockout management
  getLockout(identifier: string): Promise<{ lockedUntil: number; reason: string } | null>;
  setLockout(identifier: string, durationSeconds: number, reason: string): Promise<void>;
  clearLockout(identifier: string): Promise<void>;

  // Lockout count (for progressive lockout)
  getLockoutCount(identifier: string): Promise<number>;
  incrementLockoutCount(identifier: string): Promise<number>;
  clearLockoutCount(identifier: string): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY LOCKOUT STORE (for development)
// ════════════════════════════════════════════════════════════════════════════════

interface AttemptEntry {
  count: number;
  expiresAt: number;
}

interface LockoutEntry {
  lockedUntil: number;
  reason: string;
}

interface LockoutCountEntry {
  count: number;
  expiresAt: number;
}

class InMemoryLockoutStore implements LockoutStore {
  private attempts = new Map<string, AttemptEntry>();
  private lockouts = new Map<string, LockoutEntry>();
  private lockoutCounts = new Map<string, LockoutCountEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  async getAttempts(identifier: string): Promise<number> {
    const entry = this.attempts.get(identifier);
    if (!entry || Date.now() > entry.expiresAt) {
      return 0;
    }
    return entry.count;
  }

  async incrementAttempts(identifier: string, windowSeconds: number): Promise<number> {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.expiresAt) {
      this.attempts.set(identifier, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async clearAttempts(identifier: string): Promise<void> {
    this.attempts.delete(identifier);
  }

  async getLockout(identifier: string): Promise<{ lockedUntil: number; reason: string } | null> {
    const entry = this.lockouts.get(identifier);
    if (!entry || Date.now() > entry.lockedUntil) {
      return null;
    }
    return entry;
  }

  async setLockout(identifier: string, durationSeconds: number, reason: string): Promise<void> {
    this.lockouts.set(identifier, {
      lockedUntil: Date.now() + durationSeconds * 1000,
      reason,
    });
  }

  async clearLockout(identifier: string): Promise<void> {
    this.lockouts.delete(identifier);
  }

  async getLockoutCount(identifier: string): Promise<number> {
    const entry = this.lockoutCounts.get(identifier);
    if (!entry || Date.now() > entry.expiresAt) {
      return 0;
    }
    return entry.count;
  }

  async incrementLockoutCount(identifier: string): Promise<number> {
    const now = Date.now();
    const entry = this.lockoutCounts.get(identifier);

    // Reset after 24 hours
    const lockoutHistorySeconds = 24 * 60 * 60;

    if (!entry || now > entry.expiresAt) {
      this.lockoutCounts.set(identifier, {
        count: 1,
        expiresAt: now + lockoutHistorySeconds * 1000,
      });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  async clearLockoutCount(identifier: string): Promise<void> {
    this.lockoutCounts.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();

    Array.from(this.attempts.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) this.attempts.delete(key);
    });

    Array.from(this.lockouts.entries()).forEach(([key, entry]) => {
      if (now > entry.lockedUntil) this.lockouts.delete(key);
    });

    Array.from(this.lockoutCounts.entries()).forEach(([key, entry]) => {
      if (now > entry.expiresAt) this.lockoutCounts.delete(key);
    });
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.attempts.clear();
    this.lockouts.clear();
    this.lockoutCounts.clear();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ACCOUNT LOCKOUT MANAGER
// ════════════════════════════════════════════════════════════════════════════════

export class AccountLockoutManager {
  private store: LockoutStore;

  constructor(store?: LockoutStore) {
    this.store = store || new InMemoryLockoutStore();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK IF LOCKED
  // ─────────────────────────────────────────────────────────────────────────────

  async isLocked(identifier: string): Promise<LockoutStatus> {
    const lockout = await this.store.getLockout(identifier);

    if (!lockout) {
      const attempts = await this.store.getAttempts(identifier);
      return {
        locked: false,
        attempts,
        maxAttempts: LOCKOUT_CONFIG.maxAttempts,
      };
    }

    const now = Date.now();
    if (now > lockout.lockedUntil) {
      // Lockout expired, clear it
      await this.store.clearLockout(identifier);
      return { locked: false };
    }

    return {
      locked: true,
      remainingSeconds: Math.ceil((lockout.lockedUntil - now) / 1000),
      unlockAt: new Date(lockout.lockedUntil),
      reason: lockout.reason,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECORD FAILED ATTEMPT
  // ─────────────────────────────────────────────────────────────────────────────

  async recordFailedAttempt(identifier: string, ip?: string): Promise<AttemptResult> {
    // Check if already locked
    const lockoutStatus = await this.isLocked(identifier);
    if (lockoutStatus.locked) {
      return {
        attemptCount: LOCKOUT_CONFIG.maxAttempts,
        locked: true,
        lockoutDurationSeconds: lockoutStatus.remainingSeconds,
        remainingAttempts: 0,
      };
    }

    // Increment attempt counter
    const attemptCount = await this.store.incrementAttempts(
      identifier,
      LOCKOUT_CONFIG.attemptWindowSeconds
    );

    // Check if should lock
    if (attemptCount >= LOCKOUT_CONFIG.maxAttempts) {
      const lockoutDuration = await this.lockAccount(identifier, 'TOO_MANY_FAILED_ATTEMPTS');

      return {
        attemptCount,
        locked: true,
        lockoutDurationSeconds: lockoutDuration,
        remainingAttempts: 0,
      };
    }

    // Also track IP-based attempts if provided
    if (ip) {
      const ipAttempts = await this.store.incrementAttempts(
        `ip:${ip}`,
        LOCKOUT_CONFIG.ipAttemptWindowSeconds
      );

      if (ipAttempts >= LOCKOUT_CONFIG.ipMaxAttempts) {
        await this.lockAccount(`ip:${ip}`, 'IP_RATE_LIMITED');
      }
    }

    return {
      attemptCount,
      locked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts - attemptCount,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOCK ACCOUNT
  // ─────────────────────────────────────────────────────────────────────────────

  private async lockAccount(identifier: string, reason: string): Promise<number> {
    // Get and increment lockout count (for progressive lockout)
    const lockoutCount = await this.store.incrementLockoutCount(identifier);

    // Calculate lockout duration based on count
    const durationIndex = Math.min(
      lockoutCount - 1,
      LOCKOUT_CONFIG.lockoutDurations.length - 1
    );
    const duration = LOCKOUT_CONFIG.lockoutDurations[durationIndex];

    // Set lockout
    await this.store.setLockout(identifier, duration, reason);

    // Clear attempt counter
    await this.store.clearAttempts(identifier);

    return duration;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECORD SUCCESSFUL LOGIN
  // ─────────────────────────────────────────────────────────────────────────────

  async recordSuccess(identifier: string): Promise<void> {
    // Clear attempts on successful login
    await this.store.clearAttempts(identifier);

    // Optionally clear lockout count after successful login
    // Uncomment below to reset progressive lockout on success
    // await this.store.clearLockoutCount(identifier);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UNLOCK ACCOUNT (Admin action)
  // ─────────────────────────────────────────────────────────────────────────────

  async unlockAccount(identifier: string, clearHistory: boolean = false): Promise<void> {
    await this.store.clearLockout(identifier);
    await this.store.clearAttempts(identifier);

    if (clearHistory) {
      await this.store.clearLockoutCount(identifier);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET ATTEMPT INFO
  // ─────────────────────────────────────────────────────────────────────────────

  async getAttemptInfo(identifier: string): Promise<{
    attempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    lockoutCount: number;
  }> {
    const attempts = await this.store.getAttempts(identifier);
    const lockoutCount = await this.store.getLockoutCount(identifier);

    return {
      attempts,
      maxAttempts: LOCKOUT_CONFIG.maxAttempts,
      remainingAttempts: Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempts),
      lockoutCount,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════════════════════

let lockoutManagerInstance: AccountLockoutManager | null = null;

export function getAccountLockoutManager(store?: LockoutStore): AccountLockoutManager {
  if (!lockoutManagerInstance) {
    lockoutManagerInstance = new AccountLockoutManager(store);
  }
  return lockoutManagerInstance;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Format lockout message
// ════════════════════════════════════════════════════════════════════════════════

export function formatLockoutMessage(status: LockoutStatus): string {
  if (!status.locked) {
    if (status.attempts && status.maxAttempts) {
      const remaining = status.maxAttempts - status.attempts;
      if (remaining <= 2) {
        return `Cảnh báo: Còn ${remaining} lần thử trước khi tài khoản bị khóa`;
      }
    }
    return '';
  }

  if (status.remainingSeconds) {
    if (status.remainingSeconds < 60) {
      return `Tài khoản bị khóa. Vui lòng thử lại sau ${status.remainingSeconds} giây`;
    }
    if (status.remainingSeconds < 3600) {
      const minutes = Math.ceil(status.remainingSeconds / 60);
      return `Tài khoản bị khóa. Vui lòng thử lại sau ${minutes} phút`;
    }
    const hours = Math.ceil(status.remainingSeconds / 3600);
    return `Tài khoản bị khóa. Vui lòng thử lại sau ${hours} giờ`;
  }

  return 'Tài khoản bị khóa. Vui lòng liên hệ quản trị viên.';
}
