// src/services/analytics/turnover.service.ts
// Turnover Metrics Service

import { calculateTurnoverMetrics } from '@/lib/analytics/calculators/turnover'
import { db } from '@/lib/db'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(tenantId: string, date: Date): string {
  return `turnover:${tenantId}:${date.toISOString().split('T')[0]}`
}

export async function getTurnoverMetrics(
  tenantId: string,
  date: Date = new Date()
) {
  const cacheKey = getCacheKey(tenantId, date)
  const cached = cache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const result = await calculateTurnoverMetrics({ tenantId, date })

  cache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL,
  })

  return result
}

export async function calculateAndStoreTurnover(
  tenantId: string,
  date: Date = new Date()
) {
  const result = await calculateTurnoverMetrics({ tenantId, date })

  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  // Store in analytics metrics using findFirst + create/update
  const existing = await db.analyticsMetric.findFirst({
    where: {
      tenantId,
      metricType: 'TURNOVER',
      period: 'MONTHLY',
      periodStart,
      departmentId: null,
    },
  })

  const breakdown = {
    voluntaryRate: result.voluntaryRate,
    involuntaryRate: result.involuntaryRate,
    terminatedCount: result.terminatedCount,
    byDepartment: result.byDepartment,
    byReason: result.byReason,
  }

  if (existing) {
    await db.analyticsMetric.update({
      where: { id: existing.id },
      data: {
        value: result.rate,
        breakdown,
        calculatedAt: new Date(),
      },
    })
  } else {
    await db.analyticsMetric.create({
      data: {
        tenantId,
        metricType: 'TURNOVER',
        period: 'MONTHLY',
        periodStart,
        periodEnd,
        value: result.rate,
        breakdown,
        calculatedAt: new Date(),
      },
    })
  }

  // Clear cache
  const cacheKey = getCacheKey(tenantId, date)
  cache.delete(cacheKey)

  return result
}

export const turnoverService = {
  getTurnoverMetrics,
  calculateAndStoreTurnover,
}
