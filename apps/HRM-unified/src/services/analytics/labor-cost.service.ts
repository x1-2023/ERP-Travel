// src/services/analytics/labor-cost.service.ts
// Labor Cost Analytics Service

import { calculateLaborCostMetrics } from '@/lib/analytics/calculators/labor-cost'
import { db } from '@/lib/db'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(tenantId: string, date: Date): string {
  return `labor-cost:${tenantId}:${date.toISOString().split('T')[0]}`
}

export async function getLaborCostMetrics(
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
  const result = await calculateLaborCostMetrics({ tenantId, year, month })

  cache.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL,
  })

  return result
}

export async function calculateAndStoreLaborCost(
  tenantId: string,
  date: Date = new Date()
) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const result = await calculateLaborCostMetrics({ tenantId, year, month })

  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0)

  // Store in analytics metrics using findFirst + create/update
  const existing = await db.analyticsMetric.findFirst({
    where: {
      tenantId,
      metricType: 'LABOR_COST',
      period: 'MONTHLY',
      periodStart,
      departmentId: null,
    },
  })

  const breakdown = {
    avgPerEmployee: result.avgPerEmployee,
    salaryTotal: result.salaryTotal,
    byDepartment: result.byDepartment,
  }

  if (existing) {
    await db.analyticsMetric.update({
      where: { id: existing.id },
      data: {
        value: result.total,
        breakdown,
        calculatedAt: new Date(),
      },
    })
  } else {
    await db.analyticsMetric.create({
      data: {
        tenantId,
        metricType: 'LABOR_COST',
        period: 'MONTHLY',
        periodStart,
        periodEnd,
        value: result.total,
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

export const laborCostService = {
  getLaborCostMetrics,
  calculateAndStoreLaborCost,
}
