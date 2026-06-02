// lib/security/rate-limiter.ts

import { NextRequest, NextResponse } from 'next/server';
import { SecurityConfig } from '@/config/security.config';

/**
 * LAC VIET HR - Rate Limiter
 * Multiple rate limiting strategies with fallback to in-memory
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  handler?: (request: NextRequest, result: RateLimitResult) => NextResponse;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface RateLimitInfo {
  totalHits: number;
  windowStart: number;
  blockedUntil?: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORE
// ════════════════════════════════════════════════════════════════════════════════

class InMemoryStore {
  private store = new Map<string, RateLimitInfo>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Array.from(this.store.entries()).forEach(([key, value]) => {
        if (value.windowStart + SecurityConfig.rateLimit.global.windowMs < now) {
          this.store.delete(key);
        }
      });
    }, 60000);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.windowStart + windowMs < now) {
      const info: RateLimitInfo = { totalHits: 1, windowStart: now };
      this.store.set(key, info);
      return info;
    }

    existing.totalHits++;
    return existing;
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    return this.store.get(key) || null;
  }

  async block(key: string, durationMs: number): Promise<void> {
    const info = this.store.get(key) || { totalHits: 0, windowStart: Date.now() };
    info.blockedUntil = Date.now() + durationMs;
    this.store.set(key, info);
  }

  async isBlocked(key: string): Promise<boolean> {
    const info = this.store.get(key);
    if (!info || !info.blockedUntil) return false;
    return info.blockedUntil > Date.now();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const memoryStore = new InMemoryStore();

// ════════════════════════════════════════════════════════════════════════════════
// SLIDING WINDOW RATE LIMITER
// ════════════════════════════════════════════════════════════════════════════════

export class SlidingWindowRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'rl:',
      keyGenerator: (req) => this.defaultKeyGenerator(req),
      handler: (req, result) => this.defaultHandler(req, result),
      ...config,
    };
  }

  /**
   * Check if request should be rate limited
   */
  async check(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator!(request);
    const fullKey = `${this.config.keyPrefix}${key}`;

    try {
      // Check if blocked
      if (await memoryStore.isBlocked(fullKey)) {
        const blockInfo = await memoryStore.get(fullKey);
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: new Date(blockInfo?.blockedUntil || Date.now() + this.config.windowMs),
          retryAfter: Math.ceil(((blockInfo?.blockedUntil || 0) - Date.now()) / 1000),
        };
      }

      // Increment counter
      const info = await memoryStore.increment(fullKey, this.config.windowMs);
      const remaining = Math.max(0, this.config.maxRequests - info.totalHits);
      const resetTime = new Date(info.windowStart + this.config.windowMs);

      if (info.totalHits > this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
        };
      }

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail closed for security-sensitive endpoints (auth, write operations)
      // to prevent bypass during memory pressure or store failures
      const isSensitive = this.config.keyPrefix?.includes('login') ||
                          this.config.keyPrefix?.includes('reset') ||
                          this.config.keyPrefix?.includes('write') ||
                          this.config.keyPrefix?.includes('upload');
      return {
        success: !isSensitive, // fail closed for sensitive, fail open for reads
        limit: this.config.maxRequests,
        remaining: isSensitive ? 0 : this.config.maxRequests,
        resetTime: new Date(Date.now() + this.config.windowMs),
        retryAfter: isSensitive ? 60 : undefined,
      };
    }
  }

  /**
   * Check limit (simple interface for backward compatibility)
   */
  async checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): Promise<RateLimitResult & { retryAfter: number }> {
    const now = Date.now();
    const fullKey = `${this.config.keyPrefix}${key}`;

    try {
      const info = await memoryStore.increment(fullKey, windowMs);
      const remaining = Math.max(0, maxRequests - info.totalHits);
      const resetTime = new Date(info.windowStart + windowMs);

      if (info.totalHits > maxRequests) {
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        };
      }

      return {
        success: true,
        limit: maxRequests,
        remaining,
        resetTime,
        retryAfter: 0,
      };
    } catch {
      const isSensitive = this.config.keyPrefix?.includes('login') ||
                          this.config.keyPrefix?.includes('reset') ||
                          this.config.keyPrefix?.includes('write');
      return {
        success: !isSensitive,
        limit: maxRequests,
        remaining: isSensitive ? 0 : maxRequests,
        resetTime: new Date(now + windowMs),
        retryAfter: isSensitive ? 60 : 0,
      };
    }
  }

  /**
   * Rate limit middleware
   */
  async middleware(request: NextRequest): Promise<NextResponse | null> {
    const result = await this.check(request);

    if (!result.success) {
      return this.config.handler!(request, result);
    }

    return null; // Continue to next middleware
  }

  /**
   * Block a key for specified duration
   */
  async block(key: string, durationMs: number): Promise<void> {
    const fullKey = `${this.config.keyPrefix}${key}`;
    await memoryStore.block(fullKey, durationMs);
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const ip = getClientIdentifier(request);
    const userId = request.headers.get('x-user-id') || 'anonymous';
    return `${ip}:${userId}`;
  }

  private defaultHandler(_request: NextRequest, result: RateLimitResult): NextResponse {
    return NextResponse.json(
      {
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter || 60),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': result.resetTime.toISOString(),
        },
      }
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// RATE LIMIT CONFIGURATIONS (backward compatible)
// ════════════════════════════════════════════════════════════════════════════════

export const RATE_LIMITS = {
  // API endpoints
  api: {
    limit: 100,
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
  // Authentication endpoints (stricter)
  auth: {
    login: {
      limit: 5,
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 5 attempts per 15 minutes
    },
    passwordReset: {
      limit: 3,
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 3 attempts per hour
    },
  },
  // Sensitive operations
  sensitive: {
    limit: 5,
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
  },
  // AI/Chat endpoints
  ai: {
    limit: 20,
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 requests per minute
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// PRE-CONFIGURED RATE LIMITERS
// ════════════════════════════════════════════════════════════════════════════════

// Global API rate limiter
export const globalRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.global,
  keyPrefix: 'rl:global:',
});

// Login rate limiter (stricter)
export const loginRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.auth.login,
  keyPrefix: 'rl:login:',
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    return ip;
  },
});

// Password reset rate limiter
export const passwordResetRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.auth.passwordReset,
  keyPrefix: 'rl:reset:',
});

// API read operations
export const readRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.api.read,
  keyPrefix: 'rl:read:',
});

// API write operations
export const writeRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.api.write,
  keyPrefix: 'rl:write:',
});

// File upload rate limiter
export const uploadRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.api.upload,
  keyPrefix: 'rl:upload:',
});

// Export rate limiter
export const exportRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.api.export,
  keyPrefix: 'rl:export:',
});

// IP-based rate limiter
export const ipRateLimiter = new SlidingWindowRateLimiter({
  ...SecurityConfig.rateLimit.ip,
  keyPrefix: 'rl:ip:',
  keyGenerator: (req) => {
    return req.headers.get('x-forwarded-for')?.split(',')[0] ||
           req.headers.get('x-real-ip') ||
           '127.0.0.1';
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBLE SINGLETON
// ════════════════════════════════════════════════════════════════════════════════

export const rateLimiter = globalRateLimiter;

export function getRateLimiter(): SlidingWindowRateLimiter {
  return globalRateLimiter;
}

// ════════════════════════════════════════════════════════════════════════════════
// RATE LIMIT MIDDLEWARE HELPER
// ════════════════════════════════════════════════════════════════════════════════

export function createRateLimitMiddleware(
  limiter: SlidingWindowRateLimiter
): (request: NextRequest) => Promise<NextResponse | null> {
  return async (request: NextRequest) => {
    return limiter.middleware(request);
  };
}

export function getRateLimiterForEndpoint(
  method: string,
  path: string
): SlidingWindowRateLimiter {
  if (path.includes('/auth/login')) {
    return loginRateLimiter;
  }
  if (path.includes('/auth/reset-password')) {
    return passwordResetRateLimiter;
  }
  if (path.includes('/export')) {
    return exportRateLimiter;
  }
  if (path.includes('/upload')) {
    return uploadRateLimiter;
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return writeRateLimiter;
  }
  return readRateLimiter;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Get client identifier from request
// ════════════════════════════════════════════════════════════════════════════════

export function getClientIdentifier(request: NextRequest | Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         '127.0.0.1';
}

export function getClientIP(request: Request): string {
  return getClientIdentifier(request as NextRequest);
}

export function getRateLimitKey(
  ip: string,
  endpoint: string,
  userId?: string
): string {
  if (userId) {
    return `${userId}:${endpoint}`;
  }
  return `${ip}:${endpoint}`;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Get rate limit headers
// ════════════════════════════════════════════════════════════════════════════════

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetTime.toISOString(),
    ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
  };
}

export default {
  SlidingWindowRateLimiter,
  globalRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  readRateLimiter,
  writeRateLimiter,
  uploadRateLimiter,
  exportRateLimiter,
  ipRateLimiter,
  rateLimiter,
  getRateLimiter,
  createRateLimitMiddleware,
  getRateLimiterForEndpoint,
  getClientIdentifier,
  getClientIP,
  getRateLimitKey,
  getRateLimitHeaders,
  RATE_LIMITS,
};
