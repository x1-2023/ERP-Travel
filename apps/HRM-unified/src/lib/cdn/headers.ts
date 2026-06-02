// src/lib/cdn/headers.ts

/**
 * LAC VIET HR - CDN & Cache Headers Configuration
 * HTTP caching headers for optimal performance
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface CacheConfig {
  maxAge?: number;           // Browser cache (Cache-Control: max-age)
  sMaxAge?: number;          // CDN cache (Cache-Control: s-maxage)
  staleWhileRevalidate?: number;
  staleIfError?: number;
  private?: boolean;
  noStore?: boolean;
  noCache?: boolean;
  mustRevalidate?: boolean;
  immutable?: boolean;
  vary?: string[];
  etag?: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// CACHE PRESETS
// ════════════════════════════════════════════════════════════════════════════════

export const CachePresets = {
  // No caching - sensitive data, auth responses
  noStore: {
    noStore: true,
    private: true,
  } as CacheConfig,

  // No browser cache, CDN can cache
  cdnOnly: (ttl: number) => ({
    maxAge: 0,
    sMaxAge: ttl,
    staleWhileRevalidate: ttl / 2,
  } as CacheConfig),

  // Short cache - frequently changing data
  short: {
    maxAge: 60,              // 1 minute browser
    sMaxAge: 300,            // 5 minutes CDN
    staleWhileRevalidate: 60,
  } as CacheConfig,

  // Medium cache - semi-static data
  medium: {
    maxAge: 300,             // 5 minutes browser
    sMaxAge: 900,            // 15 minutes CDN
    staleWhileRevalidate: 300,
  } as CacheConfig,

  // Long cache - static data
  long: {
    maxAge: 3600,            // 1 hour browser
    sMaxAge: 86400,          // 24 hours CDN
    staleWhileRevalidate: 3600,
  } as CacheConfig,

  // Immutable - versioned assets
  immutable: {
    maxAge: 31536000,        // 1 year
    sMaxAge: 31536000,
    immutable: true,
  } as CacheConfig,

  // API responses - private, short cache
  api: {
    maxAge: 0,
    sMaxAge: 0,
    private: true,
    noCache: true,
    mustRevalidate: true,
    vary: ['Authorization', 'Accept-Language'],
  } as CacheConfig,

  // Public API - cacheable
  publicApi: (ttl: number) => ({
    maxAge: 0,
    sMaxAge: ttl,
    staleWhileRevalidate: ttl / 2,
    vary: ['Accept-Language'],
  } as CacheConfig),

  // HTML pages
  html: {
    maxAge: 0,
    sMaxAge: 300,
    staleWhileRevalidate: 86400,
    staleIfError: 86400,
    vary: ['Accept-Language', 'Accept-Encoding'],
  } as CacheConfig,
};

// ════════════════════════════════════════════════════════════════════════════════
// HEADER BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build Cache-Control header value
 */
export function buildCacheControl(config: CacheConfig): string {
  const directives: string[] = [];

  if (config.noStore) {
    return 'no-store';
  }

  if (config.noCache) {
    directives.push('no-cache');
  }

  if (config.private) {
    directives.push('private');
  } else {
    directives.push('public');
  }

  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }

  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }

  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (config.staleIfError !== undefined) {
    directives.push(`stale-if-error=${config.staleIfError}`);
  }

  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }

  if (config.immutable) {
    directives.push('immutable');
  }

  return directives.join(', ');
}

/**
 * Apply cache headers to response
 */
export function applyCacheHeaders(
  response: NextResponse,
  config: CacheConfig
): NextResponse {
  const cacheControl = buildCacheControl(config);
  response.headers.set('Cache-Control', cacheControl);

  if (config.vary && config.vary.length > 0) {
    response.headers.set('Vary', config.vary.join(', '));
  }

  if (config.etag) {
    response.headers.set('ETag', config.etag);
  }

  return response;
}

/**
 * Create response with cache headers
 */
export function createCachedResponse<T>(
  data: T,
  config: CacheConfig,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return applyCacheHeaders(response, config);
}

// ════════════════════════════════════════════════════════════════════════════════
// PATH-BASED CACHE RULES
// ════════════════════════════════════════════════════════════════════════════════

export interface CacheRule {
  pattern: RegExp | string;
  config: CacheConfig;
}

export const defaultCacheRules: CacheRule[] = [
  // Static assets - immutable
  {
    pattern: /^\/_next\/static\//,
    config: CachePresets.immutable,
  },

  // Images with hash - immutable
  {
    pattern: /^\/images\/.*\.[a-f0-9]{8,}\.(png|jpg|jpeg|webp|svg|gif)$/,
    config: CachePresets.immutable,
  },

  // Regular images - long cache
  {
    pattern: /^\/images\//,
    config: CachePresets.long,
  },

  // Fonts - immutable
  {
    pattern: /\.(woff2?|ttf|eot|otf)$/,
    config: CachePresets.immutable,
  },

  // CSS/JS without hash - medium cache
  {
    pattern: /\.(css|js)$/,
    config: CachePresets.medium,
  },

  // Public API endpoints
  {
    pattern: /^\/api\/public\//,
    config: CachePresets.publicApi(300), // 5 min
  },

  // Health check
  {
    pattern: /^\/api\/health$/,
    config: CachePresets.short,
  },

  // Auth endpoints - no cache
  {
    pattern: /^\/api\/auth\//,
    config: CachePresets.noStore,
  },

  // Private API - no store
  {
    pattern: /^\/api\//,
    config: CachePresets.noStore,
  },

  // HTML pages
  {
    pattern: /\.html$/,
    config: CachePresets.html,
  },
];

/**
 * Get cache config for a given path
 */
export function getCacheConfigForPath(path: string): CacheConfig {
  for (const rule of defaultCacheRules) {
    const matches = typeof rule.pattern === 'string'
      ? path.startsWith(rule.pattern)
      : rule.pattern.test(path);

    if (matches) {
      return rule.config;
    }
  }

  // Default: no cache for unknown paths
  return CachePresets.noStore;
}

// ════════════════════════════════════════════════════════════════════════════════
// CDN CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

export const CDNConfig = {
  // Vercel Edge Config
  vercel: {
    headers: [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/api/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store',
          },
        ],
      },
    ],
  },

  // CloudFlare Page Rules
  cloudflare: {
    pageRules: [
      {
        target: '*/_next/static/*',
        actions: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 31536000,
          browser_cache_ttl: 31536000,
        },
      },
      {
        target: '*/images/*',
        actions: {
          cache_level: 'cache_everything',
          edge_cache_ttl: 86400,
          browser_cache_ttl: 3600,
        },
      },
      {
        target: '*/api/*',
        actions: {
          cache_level: 'bypass',
        },
      },
    ],
  },

  // AWS CloudFront Behaviors
  cloudfront: {
    behaviors: [
      {
        pathPattern: '_next/static/*',
        cachePolicyId: 'caching-optimized',
        ttl: 31536000,
      },
      {
        pathPattern: 'images/*',
        cachePolicyId: 'caching-optimized',
        ttl: 86400,
      },
      {
        pathPattern: 'api/*',
        cachePolicyId: 'caching-disabled',
        originRequestPolicyId: 'all-viewer',
      },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// ETAG GENERATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate ETag for content
 */
export function generateETag(content: unknown): string {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(content))
    .digest('hex');
  return `"${hash}"`;
}

/**
 * Generate weak ETag (for varying representations)
 */
export function generateWeakETag(content: unknown): string {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(content))
    .digest('hex')
    .substring(0, 8);
  return `W/"${hash}"`;
}

/**
 * Check if request has matching ETag
 */
export function checkETag(
  request: Request,
  etag: string
): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');
  if (!ifNoneMatch) return false;

  const tags = ifNoneMatch.split(',').map(t => t.trim());
  return tags.includes(etag) || tags.includes('*');
}

// ════════════════════════════════════════════════════════════════════════════════
// NEXT.JS MIDDLEWARE HELPER
// ════════════════════════════════════════════════════════════════════════════════

export function withCacheHeaders(
  handler: (request: Request) => Promise<Response>,
  config: CacheConfig
) {
  return async (request: Request): Promise<Response> => {
    const response = await handler(request);

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', buildCacheControl(config));

    if (config.vary) {
      headers.set('Vary', config.vary.join(', '));
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export default {
  CachePresets,
  buildCacheControl,
  applyCacheHeaders,
  createCachedResponse,
  getCacheConfigForPath,
  CDNConfig,
  generateETag,
  generateWeakETag,
  checkETag,
  withCacheHeaders,
};
