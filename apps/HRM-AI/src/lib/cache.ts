// src/lib/cache.ts
// In-memory caching utilities for API responses

// ═══════════════════════════════════════════════════════════════
// CACHE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) return null

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keys = Array.from(this.cache.keys())
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  get size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const cache = new MemoryCache()

// ═══════════════════════════════════════════════════════════════
// CACHE UTILITIES
// ═══════════════════════════════════════════════════════════════

export type CacheTTL = {
  SHORT: number
  MEDIUM: number
  LONG: number
  VERY_LONG: number
}

export const CACHE_TTL: CacheTTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
}

export type CacheKey = {
  dashboard: (userId: string) => string
  employees: (page: number, limit: number) => string
  employee: (id: string) => string
  departments: () => string
  department: (id: string) => string
  positions: () => string
  attendance: (employeeId: string, date: string) => string
  leaves: (employeeId: string) => string
  payroll: (employeeId: string, period: string) => string
  analytics: (type: string, period: string) => string
}

export const CACHE_KEYS: CacheKey = {
  dashboard: (userId) => `dashboard:${userId}`,
  employees: (page, limit) => `employees:${page}:${limit}`,
  employee: (id) => `employee:${id}`,
  departments: () => 'departments',
  department: (id) => `department:${id}`,
  positions: () => 'positions',
  attendance: (employeeId, date) => `attendance:${employeeId}:${date}`,
  leaves: (employeeId) => `leaves:${employeeId}`,
  payroll: (employeeId, period) => `payroll:${employeeId}:${period}`,
  analytics: (type, period) => `analytics:${type}:${period}`,
}

// ═══════════════════════════════════════════════════════════════
// CACHED QUERY WRAPPER
// ═══════════════════════════════════════════════════════════════

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute query
  const result = await queryFn()

  // Store in cache
  cache.set(key, result, ttlMs)

  return result
}

// ═══════════════════════════════════════════════════════════════
// CACHE INVALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

export function invalidateEmployeeCache(employeeId?: string): void {
  if (employeeId) {
    cache.delete(CACHE_KEYS.employee(employeeId))
  }
  // Invalidate list caches
  cache.invalidatePattern('^employees:')
}

export function invalidateDepartmentCache(departmentId?: string): void {
  if (departmentId) {
    cache.delete(CACHE_KEYS.department(departmentId))
  }
  cache.delete(CACHE_KEYS.departments())
}

export function invalidateAttendanceCache(employeeId: string, date?: string): void {
  if (date) {
    cache.delete(CACHE_KEYS.attendance(employeeId, date))
  }
  cache.invalidatePattern(`^attendance:${employeeId}:`)
}

export function invalidatePayrollCache(employeeId: string): void {
  cache.invalidatePattern(`^payroll:${employeeId}:`)
}

export function invalidateDashboardCache(userId: string): void {
  cache.delete(CACHE_KEYS.dashboard(userId))
}

// ═══════════════════════════════════════════════════════════════
// PERIODIC CLEANUP
// ═══════════════════════════════════════════════════════════════

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}
