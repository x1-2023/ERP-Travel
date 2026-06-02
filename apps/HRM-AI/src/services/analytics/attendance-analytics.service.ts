// src/services/analytics/attendance-analytics.service.ts
// Attendance Analytics Service

import { calculateAttendanceMetrics } from '@/lib/analytics/calculators/attendance'
import { db } from '@/lib/db'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(tenantId: string, date: Date): string {
  return `attendance:${tenantId}:${date.toISOString().split('T')[0]}`
}

export async function getAttendanceAnalytics(
  tenantId: string,
  date: Date = new Date()
) {
  const cacheKey = getCacheKey(tenantId, date)
  const cached = cache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const result = await calculateAttendanceMetrics({ tenantId, year, month })

  cache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL,
  })

  return result
}

export async function calculateAndStoreAttendance(
  tenantId: string,
  date: Date = new Date()
) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const result = await calculateAttendanceMetrics({ tenantId, year, month })

  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0)

  // Store in analytics metrics using findFirst + create/update
  const existing = await db.analyticsMetric.findFirst({
    where: {
      tenantId,
      metricType: 'ATTENDANCE',
      period: 'MONTHLY',
      periodStart,
      departmentId: null,
    },
  })

  const breakdown = {
    rate: result.rate,
    lateRate: result.lateRate,
    lateCount: result.lateCount,
    byDepartment: result.byDepartment,
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
        metricType: 'ATTENDANCE',
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

export const attendanceAnalyticsService = {
  getAttendanceAnalytics,
  calculateAndStoreAttendance,
}
