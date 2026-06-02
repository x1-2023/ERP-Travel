/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and brute force attacks
 */

// @ts-ignore -- rate-limiter-flexible may not be installed yet
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITERS
// ═══════════════════════════════════════════════════════════════════════════════

const limiters = {
  // General API: 100 requests per minute
  general: new RateLimiterMemory({
    points: 100,
    duration: 60,
    blockDuration: 60,
  }),

  // Auth endpoints: 5 attempts per minute (brute force protection)
  auth: new RateLimiterMemory({
    points: 5,
    duration: 60,
    blockDuration: 300, // 5 minute block after exceeded
  }),

  // Heavy operations: 10 per minute
  heavy: new RateLimiterMemory({
    points: 10,
    duration: 60,
    blockDuration: 120,
  }),

  // Strict: 3 per minute (for password reset, etc.)
  strict: new RateLimiterMemory({
    points: 3,
    duration: 60,
    blockDuration: 600, // 10 minute block
  }),

  // Upload: 5 per minute
  upload: new RateLimiterMemory({
    points: 5,
    duration: 60,
    blockDuration: 120,
  }),
};

type LimiterType = keyof typeof limiters;

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rate limiting middleware factory
 * @param type - Type of rate limiter to use
 * @returns Express middleware function
 */
export function rateLimit(type: LimiterType = 'general') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const limiter = limiters[type];
    const key = getClientIdentifier(req);

    try {
      const result = await limiter.consume(key);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limiter.points.toString());
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints.toString());
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + result.msBeforeNext).toISOString()
      );

      next();
    } catch (rejRes) {
      const rlRes = rejRes as RateLimiterRes;

      // Log rate limit exceeded
      console.warn('Rate limit exceeded', {
        ip: key,
        type,
        path: req.path,
        method: req.method,
      });

      // Set retry header
      res.setHeader('Retry-After', Math.ceil(rlRes.msBeforeNext / 1000).toString());
      res.setHeader('X-RateLimit-Limit', limiter.points.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + rlRes.msBeforeNext).toISOString()
      );

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(rlRes.msBeforeNext / 1000),
      });
    }
  };
}

/**
 * Get unique client identifier for rate limiting
 */
function getClientIdentifier(req: Request): string {
  // Try to get the real IP from various headers
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return req.ip || req.socket.remoteAddress || 'anonymous';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const rateLimitGeneral = rateLimit('general');
export const rateLimitAuth = rateLimit('auth');
export const rateLimitHeavy = rateLimit('heavy');
export const rateLimitStrict = rateLimit('strict');
export const rateLimitUpload = rateLimit('upload');
