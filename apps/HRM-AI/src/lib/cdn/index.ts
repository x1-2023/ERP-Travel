// src/lib/cdn/index.ts

/**
 * LAC VIET HR - CDN Module
 * HTTP caching and CDN configuration
 */

export {
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
  defaultCacheRules,
  type CacheConfig,
  type CacheRule,
} from './headers';
