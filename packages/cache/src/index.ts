// ============================================================
// Performance & Caching Layer
// Redis caching, query optimization, connection pooling,
// response compression, batch operations
// ============================================================

// ─── Types ───────────────────────────────────────────────────

export interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    maxRetriesPerRequest?: number;
  };
  defaultTTL: number;            // Default TTL in seconds
  maxMemoryPolicy?: string;      // Redis maxmemory-policy
  enableCompression?: boolean;   // Compress large values
  compressionThreshold?: number; // Bytes threshold for compression
}

export interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tags: string[];
  hitCount: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsed: string;
  evictions: number;
}

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

// ─── Multi-layer Cache Manager ───────────────────────────────

/**
 * L1: In-memory (fast, per-process, limited size)
 * L2: Redis (shared, persistent, larger capacity)
 *
 * Read: L1 → L2 → Source
 * Write: Source → L2 → L1
 * Invalidate: L1 + L2
 */
export class CacheManager {
  private l1: Map<string, CacheEntry> = new Map();
  private l1MaxSize: number;
  private l1Stats = { hits: 0, misses: 0 };
  private l2Stats = { hits: 0, misses: 0 };
  private tagIndex = new Map<string, Set<string>>(); // tag → keys
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300, // 5 minutes default
      enableCompression: true,
      compressionThreshold: 1024, // 1KB
      ...config,
    };
    this.l1MaxSize = 1000; // Max 1000 entries in L1

    // Periodic L1 cleanup
    setInterval(() => this.cleanExpiredL1(), 60000);
  }

  /**
   * Get value from cache (L1 → L2 → miss)
   */
  async get<T>(key: string): Promise<T | null> {
    // L1 check
    const l1Entry = this.l1.get(key);
    if (l1Entry && l1Entry.expiresAt > Date.now()) {
      l1Entry.hitCount++;
      this.l1Stats.hits++;
      return l1Entry.data as T;
    }

    if (l1Entry) {
      this.l1.delete(key); // Expired
    }

    this.l1Stats.misses++;

    // L2 check would go through Redis here
    // For now, return null (Redis integration in production)
    this.l2Stats.misses++;
    return null;
  }

  /**
   * Set value in cache (L1 + L2)
   */
  async set<T>(
    key: string,
    value: T,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<void> {
    const ttl = options.ttl ?? this.config.defaultTTL;
    const tags = options.tags ?? [];
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data: value,
      createdAt: now,
      expiresAt: now + ttl * 1000,
      tags,
      hitCount: 0,
    };

    // L1: evict if full (LRU-like: remove oldest)
    if (this.l1.size >= this.l1MaxSize) {
      this.evictL1();
    }

    this.l1.set(key, entry);

    // Tag index
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }

    // L2: Redis SET with TTL (production implementation)
    // await this.redis.set(key, JSON.stringify(entry), 'EX', ttl);
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    this.l1.delete(key);
    // await this.redis.del(key);
  }

  /**
   * Invalidate all keys with a given tag
   * Example: invalidateByTag('tenant:abc') clears all tenant abc's cache
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys || keys.size === 0) return 0;

    let count = 0;
    for (const key of keys) {
      this.l1.delete(key);
      count++;
    }
    this.tagIndex.delete(tag);

    // Redis: use SCAN + DEL for tag-based invalidation
    return count;
  }

  /**
   * Invalidate by pattern (e.g., "products:*")
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let count = 0;

    for (const key of this.l1.keys()) {
      if (regex.test(key)) {
        this.l1.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: { ttl?: number; tags?: string[]; strategy?: CacheStrategy } = {}
  ): Promise<T> {
    const strategy = options.strategy ?? 'cache-first';

    if (strategy === 'cache-first') {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;

      const value = await factory();
      await this.set(key, value, options);
      return value;
    }

    if (strategy === 'stale-while-revalidate') {
      const cached = await this.get<T>(key);

      // Return stale data immediately, revalidate in background
      if (cached !== null) {
        factory().then(value => this.set(key, value, options)).catch(() => {});
        return cached;
      }

      const value = await factory();
      await this.set(key, value, options);
      return value;
    }

    // network-first
    try {
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;
      throw new Error(`Cache miss and network error for key: ${key}`);
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    for (const key of keys) {
      results.set(key, await this.get<T>(key));
    }
    return results;
  }

  /**
   * Batch set multiple entries
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, { ttl: entry.ttl, tags: entry.tags });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalHits = this.l1Stats.hits + this.l2Stats.hits;
    const totalMisses = this.l1Stats.misses + this.l2Stats.misses;
    const total = totalHits + totalMisses;

    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: total > 0 ? totalHits / total : 0,
      totalKeys: this.l1.size,
      memoryUsed: `~${Math.round(this.l1.size * 0.5)}KB`, // Rough estimate
      evictions: 0,
    };
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    this.l1.clear();
    this.tagIndex.clear();
    this.l1Stats = { hits: 0, misses: 0 };
    this.l2Stats = { hits: 0, misses: 0 };
    // await this.redis.flushdb();
  }

  // ── Internal ────────────────────────────────────────────────

  private evictL1(): void {
    // Remove least recently created entries (simple strategy)
    const entries = Array.from(this.l1.entries())
      .sort((a, b) => a[1].hitCount - b[1].hitCount);

    // Remove bottom 10%
    const removeCount = Math.max(1, Math.floor(this.l1MaxSize * 0.1));
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      this.l1.delete(entries[i][0]);
    }
  }

  private cleanExpiredL1(): void {
    const now = Date.now();
    for (const [key, entry] of this.l1) {
      if (entry.expiresAt <= now) {
        this.l1.delete(key);
      }
    }
  }
}

// ─── Pre-configured Cache Keys ───────────────────────────────

/**
 * Cache key generators for ERP entities
 * Consistent naming: {module}:{entity}:{id}
 */
export const CacheKeys = {
  // Master data — long TTL (rarely changes)
  customer: (tenantId: string, id: string) => `md:customer:${tenantId}:${id}`,
  customerList: (tenantId: string, page: number) => `md:customers:${tenantId}:p${page}`,
  product: (tenantId: string, id: string) => `md:product:${tenantId}:${id}`,
  productList: (tenantId: string, page: number) => `md:products:${tenantId}:p${page}`,
  employee: (tenantId: string, id: string) => `md:employee:${tenantId}:${id}`,

  // Accounting — medium TTL
  trialBalance: (tenantId: string, period: string) => `acc:tb:${tenantId}:${period}`,
  balanceSheet: (tenantId: string, date: string) => `acc:bs:${tenantId}:${date}`,
  chartOfAccounts: (tenantId: string) => `acc:coa:${tenantId}`,

  // E-commerce — short TTL (frequently changes)
  cart: (cartId: string) => `ecom:cart:${cartId}`,
  productCatalog: (storeId: string, page: number) => `ecom:catalog:${storeId}:p${page}`,
  shippingRates: (storeId: string, province: string) => `ecom:ship:${storeId}:${province}`,

  // User session
  userSession: (userId: string) => `session:${userId}`,
  userPermissions: (userId: string) => `perms:${userId}`,

  // Tenant config
  tenantConfig: (tenantId: string) => `tenant:config:${tenantId}`,
  tenantFeatures: (tenantId: string) => `tenant:features:${tenantId}`,
};

/**
 * Default TTLs per category (seconds)
 */
export const CacheTTL = {
  SHORT: 60,             // 1 minute — real-time data (cart, stock)
  MEDIUM: 300,           // 5 minutes — reports, lists
  LONG: 3600,            // 1 hour — master data, config
  VERY_LONG: 86400,      // 24 hours — chart of accounts, static data
  SESSION: 1800,         // 30 minutes — user sessions
};

// ─── Query Optimization Helpers ──────────────────────────────

/**
 * Cursor-based pagination (better than offset for large datasets)
 */
export interface CursorPagination {
  cursor?: string;       // Encoded cursor (base64 of id + sortField)
  limit: number;
  direction: 'forward' | 'backward';
}

export interface CursorPage<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

/**
 * Encode cursor from record
 */
export function encodeCursor(id: string, sortValue: string | number | Date): string {
  const value = sortValue instanceof Date ? sortValue.toISOString() : String(sortValue);
  return Buffer.from(`${id}|${value}`).toString('base64url');
}

/**
 * Decode cursor
 */
export function decodeCursor(cursor: string): { id: string; sortValue: string } {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
  const [id, ...rest] = decoded.split('|');
  return { id, sortValue: rest.join('|') };
}

/**
 * Build Prisma cursor pagination query
 */
export function buildCursorQuery(
  pagination: CursorPagination,
  sortField: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, any> {
  const query: Record<string, any> = {
    take: pagination.limit + 1, // +1 to detect hasMore
    orderBy: { [sortField]: sortOrder },
  };

  if (pagination.cursor) {
    const { id, sortValue } = decodeCursor(pagination.cursor);
    query.cursor = { id };
    query.skip = 1; // Skip the cursor item
  }

  return query;
}

// ─── Request Deduplication ───────────────────────────────────

/**
 * Deduplicates concurrent identical requests
 * Multiple concurrent requests for the same data result in only one actual fetch
 */
export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;

    const promise = factory().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// ─── DataLoader Pattern ──────────────────────────────────────

/**
 * Batches and deduplicates individual loads into batch queries
 * Prevents N+1 query problem
 */
export class BatchLoader<K, V> {
  private queue: Array<{
    key: K;
    resolve: (value: V | null) => void;
    reject: (error: Error) => void;
  }> = [];
  private scheduled = false;

  constructor(
    private batchFn: (keys: K[]) => Promise<Map<K, V>>,
    private options: { maxBatchSize?: number; batchDelayMs?: number } = {}
  ) {}

  load(key: K): Promise<V | null> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (!this.scheduled) {
        this.scheduled = true;
        setTimeout(() => this.executeBatch(), this.options.batchDelayMs ?? 10);
      }

      // Force execute if batch is full
      if (this.queue.length >= (this.options.maxBatchSize ?? 100)) {
        this.executeBatch();
      }
    });
  }

  private async executeBatch(): Promise<void> {
    this.scheduled = false;
    const batch = this.queue.splice(0);
    if (batch.length === 0) return;

    const uniqueKeys = [...new Set(batch.map(item => item.key))];

    try {
      const results = await this.batchFn(uniqueKeys);
      for (const item of batch) {
        item.resolve(results.get(item.key) ?? null);
      }
    } catch (error) {
      for (const item of batch) {
        item.reject(error as Error);
      }
    }
  }
}

// ─── Exports ─────────────────────────────────────────────────

export function createCacheManager(config?: Partial<CacheConfig>): CacheManager {
  return new CacheManager(config);
}
