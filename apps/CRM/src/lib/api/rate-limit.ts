// In-memory rate limiter — resets on server restart, OK for MVP
// For production, replace with Redis-backed solution

interface RateLimitEntry {
  count: number
  resetAt: number // timestamp ms
}

interface RateLimitOptions {
  key: string
  limit: number
  window: number // seconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function ensureCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        store.delete(key)
      }
    })
  }, 60_000)
  // Allow process to exit without waiting for interval
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  ensureCleanup()

  const { key, limit, window } = options
  const now = Date.now()
  const windowMs = window * 1000

  const entry = store.get(key)

  // No entry or window expired → new window
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt: new Date(resetAt) }
  }

  // Within window
  entry.count++
  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: new Date(entry.resetAt) }
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: new Date(entry.resetAt),
  }
}

// ── Preset tiers ────────────────────────────────────────────────────

export function rateLimitGeneral(userId: string) {
  return rateLimit({ key: `general:${userId}`, limit: 100, window: 60 })
}

export function rateLimitAuth(ip: string) {
  return rateLimit({ key: `auth:${ip}`, limit: 10, window: 60 })
}

export function rateLimitEmail(userId: string) {
  return rateLimit({ key: `email:${userId}`, limit: 20, window: 60 })
}

export function rateLimitPdf(userId: string) {
  return rateLimit({ key: `pdf:${userId}`, limit: 10, window: 60 })
}

export function rateLimitSearch(userId: string) {
  return rateLimit({ key: `search:${userId}`, limit: 30, window: 60 })
}
