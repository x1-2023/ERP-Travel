import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/analytics/win-loss — Win/Loss analysis
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const { searchParams } = req.nextUrl
    const periodDays = parseInt(searchParams.get('period') || '365')
    const segment = searchParams.get('segment')
    const baseCurrency = searchParams.get('baseCurrency') || 'USD'

    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    // Load exchange rates
    const exchangeRates = await prisma.exchangeRate.findMany({ where: { isActive: true } })
    const rateMap: Record<string, number> = {}
    for (const r of exchangeRates) {
      rateMap[r.currency] = Number(r.rateToBase)
    }

    const convertToBase = (value: number, currency: string): number => {
      if (currency === baseCurrency) return value
      const rate = rateMap[currency]
      if (!rate || rate === 0) return value
      return value * rate
    }

    // Get won and lost stage IDs
    const wonStages = await prisma.stage.findMany({ where: { isWon: true }, select: { id: true } })
    const lostStages = await prisma.stage.findMany({ where: { isLost: true }, select: { id: true } })
    const wonStageIds = wonStages.map((s) => s.id)
    const lostStageIds = lostStages.map((s) => s.id)

    const baseWhere: Record<string, unknown> = {
      closedAt: { gte: since },
    }
    if (segment) (baseWhere as any).dealType = segment

    // Fetch won and lost deals
    const [wonDeals, lostDeals] = await Promise.all([
      prisma.deal.findMany({
        where: { ...baseWhere, stageId: { in: wonStageIds } } as any,
        select: { id: true, value: true, currency: true, dealType: true, closedAt: true },
      }),
      prisma.deal.findMany({
        where: { ...baseWhere, stageId: { in: lostStageIds } } as any,
        select: {
          id: true, value: true, currency: true, dealType: true,
          lostReason: true, competitorName: true, closedAt: true,
        },
      }),
    ])

    const wonCount = wonDeals.length
    const lostCount = lostDeals.length
    const total = wonCount + lostCount
    const winRate = total > 0 ? Math.round((wonCount / total) * 100) / 100 : 0

    const totalWonValue = wonDeals.reduce((s, d) => s + convertToBase(Number(d.value), d.currency), 0)
    const totalLostValue = lostDeals.reduce((s, d) => s + convertToBase(Number(d.value), d.currency), 0)

    // By segment
    const segmentMap: Record<string, { won: number; lost: number; wonValue: number; lostValue: number }> = {}
    for (const d of wonDeals) {
      const seg = d.dealType || 'UNKNOWN'
      if (!segmentMap[seg]) segmentMap[seg] = { won: 0, lost: 0, wonValue: 0, lostValue: 0 }
      segmentMap[seg].won += 1
      segmentMap[seg].wonValue += convertToBase(Number(d.value), d.currency)
    }
    for (const d of lostDeals) {
      const seg = d.dealType || 'UNKNOWN'
      if (!segmentMap[seg]) segmentMap[seg] = { won: 0, lost: 0, wonValue: 0, lostValue: 0 }
      segmentMap[seg].lost += 1
      segmentMap[seg].lostValue += convertToBase(Number(d.value), d.currency)
    }

    const bySegment = Object.entries(segmentMap).map(([seg, data]) => ({
      segment: seg,
      won: data.won,
      lost: data.lost,
      winRate: (data.won + data.lost) > 0
        ? Math.round((data.won / (data.won + data.lost)) * 100) / 100
        : 0,
      avgValue: data.won > 0 ? Math.round(data.wonValue / data.won) : 0,
    }))

    // Loss reasons
    const reasonMap: Record<string, { count: number; totalValue: number }> = {}
    for (const d of lostDeals) {
      const reason = d.lostReason || 'OTHER'
      if (!reasonMap[reason]) reasonMap[reason] = { count: 0, totalValue: 0 }
      reasonMap[reason].count += 1
      reasonMap[reason].totalValue += convertToBase(Number(d.value), d.currency)
    }

    const lossReasons = Object.entries(reasonMap)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        totalValue: Math.round(data.totalValue),
        percentage: lostCount > 0 ? Math.round((data.count / lostCount) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Competitor analysis
    const competitorMap: Record<string, { dealsLost: number; totalValueLost: number }> = {}
    for (const d of lostDeals) {
      if (!d.competitorName) continue
      if (!competitorMap[d.competitorName]) competitorMap[d.competitorName] = { dealsLost: 0, totalValueLost: 0 }
      competitorMap[d.competitorName].dealsLost += 1
      competitorMap[d.competitorName].totalValueLost += convertToBase(Number(d.value), d.currency)
    }

    const competitors = Object.entries(competitorMap)
      .map(([name, data]) => ({
        name,
        dealsLost: data.dealsLost,
        totalValueLost: Math.round(data.totalValueLost),
      }))
      .sort((a, b) => b.totalValueLost - a.totalValueLost)

    // Trend (win rate by month)
    const trendMap: Record<string, { won: number; lost: number }> = {}
    for (const d of wonDeals) {
      if (!d.closedAt) continue
      const month = `${d.closedAt.getFullYear()}-${String(d.closedAt.getMonth() + 1).padStart(2, '0')}`
      if (!trendMap[month]) trendMap[month] = { won: 0, lost: 0 }
      trendMap[month].won += 1
    }
    for (const d of lostDeals) {
      if (!d.closedAt) continue
      const month = `${d.closedAt.getFullYear()}-${String(d.closedAt.getMonth() + 1).padStart(2, '0')}`
      if (!trendMap[month]) trendMap[month] = { won: 0, lost: 0 }
      trendMap[month].lost += 1
    }

    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        winRate: (data.won + data.lost) > 0
          ? Math.round((data.won / (data.won + data.lost)) * 100) / 100
          : 0,
        won: data.won,
        lost: data.lost,
      }))

    return apiSuccess({
      overall: {
        won: wonCount,
        lost: lostCount,
        winRate,
        totalValue: Math.round(totalWonValue + totalLostValue),
        wonValue: Math.round(totalWonValue),
        lostValue: Math.round(totalLostValue),
      },
      bySegment,
      lossReasons,
      competitors,
      trend,
      baseCurrency,
    })
  } catch (error) {
    return handleApiError(error, '/api/analytics/win-loss')
  }
}
