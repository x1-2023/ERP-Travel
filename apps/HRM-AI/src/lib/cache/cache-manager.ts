// src/lib/cache/cache-manager.ts

/**
 * LAC VIET HR - Cache Manager
 * Multi-tier caching with automatic invalidation, cache-aside pattern, and monitoring
 */

import { RedisClient, getRedisClient } from './redis-client';
import { generateCacheKey, CacheKeyParams } from './cache-keys';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface CacheOptions {
  ttl?: number;              // Time to live in seconds
  staleWhileRevalidate?: number;  // Serve stale while fetching fresh
  tags?: string[];           // Tags for group invalidation
  compress?: boolean;        // Compress large values
  namespace?: string;        // Custom namespace
}

export interface CachedValue<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  tags?: string[];
  stale?: boolean;
}

export interface CacheResult<T> {
  value: T | null;
  hit: boolean;
  stale: boolean;
  ttl: number;
}

type FetchFunction<T> = () => Promise<T>;

// ════════════════════════════════════════════════════════════════════════════════
// CACHE TTL PRESETS
// ════════════════════════════════════════════════════════════════════════════════

export const CacheTTL = {
  // Very short-lived
  REALTIME: 5,           // 5 seconds
  VERY_SHORT: 30,        // 30 seconds

  // Short-lived
  SHORT: 60,             // 1 minute
  LIST: 120,             // 2 minutes

  // Medium
  MEDIUM: 300,           // 5 minutes
  ENTITY: 300,           // 5 minutes

  // Long-lived
  LONG: 900,             // 15 minutes
  PERMISSION: 900,       // 15 minutes

  // Very long-lived
  VERY_LONG: 3600,       // 1 hour
  CONFIG: 3600,          // 1 hour

  // Session/Auth
  SESSION: 86400,        // 24 hours
  REFRESH_TOKEN: 604800, // 7 days

  // Static
  STATIC: 2592000,       // 30 days
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE (L1)
// ════════════════════════════════════════════════════════════════════════════════

class MemoryCache {
  private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    // Evict if at capacity (LRU-like: delete oldest)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CACHE MANAGER CLASS
// ════════════════════════════════════════════════════════════════════════════════

export class CacheManager {
  private redis: RedisClient;
  private memory: MemoryCache;
  private defaultTTL: number;
  private namespace: string;
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor(options: {
    redis?: RedisClient;
    defaultTTL?: number;
    namespace?: string;
    memoryMaxSize?: number;
  } = {}) {
    this.redis = options.redis || getRedisClient();
    this.memory = new MemoryCache(options.memoryMaxSize || 1000);
    this.defaultTTL = options.defaultTTL || CacheTTL.MEDIUM;
    this.namespace = options.namespace || 'cache';
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CORE METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get value from cache (L1 -> L2)
   */
  async get<T>(key: string): Promise<CacheResult<T>> {
    const fullKey = this.getFullKey(key);

    // L1: Memory cache
    const memoryValue = this.memory.get<CachedValue<T>>(fullKey);
    if (memoryValue) {
      return {
        value: memoryValue.data,
        hit: true,
        stale: memoryValue.stale || false,
        ttl: Math.floor((memoryValue.expiresAt - Date.now()) / 1000),
      };
    }

    // L2: Redis cache
    const redisValue = await this.redis.get<CachedValue<T>>(fullKey);
    if (redisValue) {
      // Promote to L1
      const ttlMs = (redisValue.expiresAt - Date.now());
      if (ttlMs > 0) {
        this.memory.set(fullKey, redisValue, Math.min(ttlMs, 60000)); // Max 1 min in memory
      }

      return {
        value: redisValue.data,
        hit: true,
        stale: redisValue.stale || false,
        ttl: Math.floor(ttlMs / 1000),
      };
    }

    return {
      value: null,
      hit: false,
      stale: false,
      ttl: 0,
    };
  }

  /**
   * Set value in cache (L1 + L2)
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = options.ttl || this.defaultTTL;
    const now = Date.now();

    const cachedValue: CachedValue<T> = {
      data: value,
      cachedAt: now,
      expiresAt: now + (ttl * 1000),
      tags: options.tags,
    };

    // L1: Memory cache
    this.memory.set(fullKey, cachedValue, Math.min(ttl * 1000, 60000));

    // L2: Redis cache
    await this.redis.setex(fullKey, ttl, cachedValue);

    // Index tags for group invalidation
    if (options.tags) {
      await this.indexTags(fullKey, options.tags);
    }
  }

  /**
   * Cache-aside pattern: Get or fetch and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: FetchFunction<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const result = await this.get<T>(key);

    if (result.hit && !result.stale) {
      return result.value!;
    }

    // Stale-while-revalidate
    if (result.hit && result.stale && options.staleWhileRevalidate) {
      // Return stale value immediately, refresh in background
      this.refreshInBackground(key, fetchFn, options);
      return result.value!;
    }

    // Fetch fresh value
    const value = await fetchFn();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);

    this.memory.delete(fullKey);
    await this.redis.del(fullKey);
  }

  /**
   * Delete by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const fullPattern = this.getFullKey(pattern);

    this.memory.deletePattern(fullPattern);
    return await this.redis.deletePattern(fullPattern);
  }

  /**
   * Delete by tags
   */
  async deleteByTags(tags: string[]): Promise<number> {
    let deleted = 0;

    for (const tag of tags) {
      const tagKey = `${this.namespace}:tag:${tag}`;
      const keys = await this.redis.smembers(tagKey);

      for (const key of keys) {
        this.memory.delete(key);
        await this.redis.del(key);
        deleted++;
      }

      await this.redis.del(tagKey);
    }

    return deleted;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);

    if (this.memory.get(fullKey) !== null) {
      return true;
    }

    return await this.redis.exists(fullKey);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SPECIALIZED CACHE METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Cache entity by ID
   */
  async cacheEntity<T>(
    entity: string,
    id: string,
    data: T,
    ttl: number = CacheTTL.ENTITY
  ): Promise<void> {
    const key = generateCacheKey({ entity, id });
    await this.set(key, data, { ttl, tags: [entity, `${entity}:${id}`] });
  }

  /**
   * Get cached entity
   */
  async getEntity<T>(entity: string, id: string): Promise<T | null> {
    const key = generateCacheKey({ entity, id });
    const result = await this.get<T>(key);
    return result.value;
  }

  /**
   * Invalidate entity
   */
  async invalidateEntity(entity: string, id: string): Promise<void> {
    // Delete specific entity
    const key = generateCacheKey({ entity, id });
    await this.delete(key);

    // Delete related list caches
    await this.deletePattern(`${entity}:list:*`);
  }

  /**
   * Cache list with pagination
   */
  async cacheList<T>(
    entity: string,
    params: Record<string, unknown>,
    data: T[],
    ttl: number = CacheTTL.LIST
  ): Promise<void> {
    const key = generateCacheKey({ entity, action: 'list', params });
    await this.set(key, data, { ttl, tags: [entity, `${entity}:list`] });
  }

  /**
   * Get cached list
   */
  async getList<T>(entity: string, params: Record<string, unknown>): Promise<T[] | null> {
    const key = generateCacheKey({ entity, action: 'list', params });
    const result = await this.get<T[]>(key);
    return result.value;
  }

  /**
   * Cache user session
   */
  async cacheSession(sessionId: string, data: unknown, ttl: number = CacheTTL.SESSION): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, data, { ttl });
  }

  /**
   * Get cached session
   */
  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    const result = await this.get<T>(key);
    return result.value;
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.delete(`session:${sessionId}`);
  }

  /**
   * Cache user permissions
   */
  async cachePermissions(userId: string, permissions: string[]): Promise<void> {
    const key = `permissions:${userId}`;
    await this.set(key, permissions, { ttl: CacheTTL.PERMISSION });
  }

  /**
   * Get cached permissions
   */
  async getPermissions(userId: string): Promise<string[] | null> {
    const key = `permissions:${userId}`;
    const result = await this.get<string[]>(key);
    return result.value;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COUNTER METHODS (Rate limiting, statistics)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Increment counter
   */
  async incrementCounter(key: string, ttl?: number): Promise<number> {
    const fullKey = this.getFullKey(`counter:${key}`);
    const count = await this.redis.incr(fullKey);

    if (ttl && count === 1) {
      await this.redis.expire(fullKey, ttl);
    }

    return count;
  }

  /**
   * Get counter value
   */
  async getCounter(key: string): Promise<number> {
    const fullKey = this.getFullKey(`counter:${key}`);
    const value = await this.redis.get<number>(fullKey);
    return value || 0;
  }

  /**
   * Sliding window rate limit counter
   */
  async slidingWindowIncrement(
    key: string,
    windowSizeSeconds: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; current: number; remaining: number }> {
    const now = Date.now();
    const windowKey = this.getFullKey(`ratelimit:${key}`);
    const windowStart = now - (windowSizeSeconds * 1000);

    // Use sorted set for sliding window
    const pipeline = this.redis.pipeline();

    // Remove old entries
    pipeline.zremrangebyscore(windowKey, 0, windowStart);

    // Add current request
    pipeline.zadd(windowKey, now, `${now}-${Math.random()}`);

    // Count requests in window
    pipeline.zcard(windowKey);

    // Set expiry
    pipeline.expire(windowKey, windowSizeSeconds);

    const results = await pipeline.exec();
    const current = (results?.[2]?.[1] as number) || 0;
    const allowed = current <= maxRequests;
    const remaining = Math.max(0, maxRequests - current);

    return { allowed, current, remaining };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  private getFullKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  private async indexTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `${this.namespace}:tag:${tag}`;
      await this.redis.sadd(tagKey, key);
    }
  }

  private async refreshInBackground<T>(
    key: string,
    fetchFn: FetchFunction<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const value = await fetchFn();
      await this.set(key, value, options);
    } catch (error) {
      console.error(`[CacheManager] Background refresh failed for ${key}:`, error);
    }
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memory.clear();
    await this.redis.deletePattern(`${this.namespace}:*`);
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const redisStats = await this.redis.getStats();
    return {
      ...redisStats,
      memorySize: this.memory.size(),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return await this.redis.ping();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.memory.destroy();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════════════════════

let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
}

export default CacheManager;
