// src/lib/cache/index.ts

/**
 * LAC VIET HR - Cache Module
 * High-performance multi-tier caching system
 */

// Redis Client
export {
  RedisClient,
  getRedisClient,
  createRedisClient,
  type RedisConfig,
  type CacheStats,
} from './redis-client';

// Cache Manager
export {
  CacheManager,
  getCacheManager,
  CacheTTL,
  type CacheOptions,
  type CachedValue,
  type CacheResult,
} from './cache-manager';

// Cache Keys
export {
  CacheKeys,
  CachePrefix,
  CacheTags,
  InvalidationPatterns,
  generateCacheKey,
  hashParams,
  type CacheKeyParams,
} from './cache-keys';

// Cache Invalidation
export {
  CacheInvalidator,
  getCacheInvalidator,
  InvalidateCache,
  type EntityType,
  type EventType,
  type InvalidationEvent,
  type InvalidationResult,
} from './invalidation';

// Cache Warmup
export {
  CacheWarmer,
  initializeCacheWarmup,
  type WarmupConfig,
  type WarmupResult,
} from './cache-warmup';
