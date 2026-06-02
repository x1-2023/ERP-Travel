/**
 * Sprint 0 Fix 6: Rate Limiting for Vercel Functions
 * In-memory rate limiter (for production, use Redis via Upstash)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 } as RateLimitConfig,
  standard: { windowMs: 60 * 1000, maxRequests: 100 } as RateLimitConfig,
  read: { windowMs: 60 * 1000, maxRequests: 200 } as RateLimitConfig,
  sensitive: { windowMs: 60 * 60 * 1000, maxRequests: 20 } as RateLimitConfig,
};

type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse> | void;

export function rateLimiter(config: RateLimitConfig = RATE_LIMITS.standard) {
  return (handler: ApiHandler): ApiHandler => {
    return async (req: VercelRequest, res: VercelResponse) => {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                 (req.headers['x-real-ip'] as string) || 'unknown';
      const key = `${ip}:${req.url?.split('?')[0]}`;

      const now = Date.now();
      const entry = store.get(key);

      if (entry && entry.resetAt > now) {
        if (entry.count >= config.maxRequests) {
          const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
          res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('Retry-After', retryAfter.toString());
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many requests. Retry after ${retryAfter} seconds.`,
              retryAfter,
            },
          });
        }
        entry.count++;
      } else {
        store.set(key, { count: 1, resetAt: now + config.windowMs });
      }

      const current = store.get(key)!;
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current.count).toString());

      return handler(req, res);
    };
  };
}

export const authRateLimit = rateLimiter(RATE_LIMITS.auth);
export const standardRateLimit = rateLimiter(RATE_LIMITS.standard);
