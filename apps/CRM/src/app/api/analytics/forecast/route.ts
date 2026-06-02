import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/analytics/forecast — Weighted pipeline forecast by quarter
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const { searchParams } = req.nextUrl
    const baseCurrency = searchParams.get('baseCurrency') || 'USD'

    // Load exchange rates
    const exchangeRates = await prisma.exchangeRate.findMany({ where: { isActive: true } })
    const rateMap: Record<string, number> = {}
    for (const r of exchangeRates) {
      rateMap[r.currency] = Number(r.rateToBase)
    }

    // Get won/lost stage IDs to exclude
    const closedStages = await prisma.stage.findMany({
      where: { OR: [{ isWon: true }, { isLost: true }] },
      select: { id: true },
    })
    const closedStageIds = closedStages.map((s) => s.id)

    // Get all open deals
    const deals = await prisma.deal.findMany({
      where: {
        stageId: { notIn: closedStageIds },
      },
      select: {
        id: true,
        value: true,
        currency: true,
        dealType: true,
        expectedCloseAt: true,
        createdAt: true,
        stage: { select: { probability: true } },
      },
    })

    // Helper: get quarter string from date
    const getQuarter = (d: Date): string => {
      const q = Math.ceil((d.getMonth() + 1) / 3)
      return `${d.getFullYear()}-Q${q}`
    }

    // Helper: convert to base currency
    const convertToBase = (value: number, currency: string): number => {
      if (currency === baseCurrency) return value
      const rate = rateMap[currency]
      if (!rate || rate === 0) return value
      return value * rate
    }

    // Group deals by quarter
    const quarterMap: Record<string, {
      weighted: number
      unweighted: number
      dealCount: number
      bySegment: Record<string, { weighted: number; count: number }>
      byCurrency: Record<string, { weighted: number; count: number }>
    }> = {}

    const now = new Date()
    // Default expected close: 90 days from creation
    const DEFAULT_CYCLE_DAYS = 90

    for (const deal of deals) {
      const value = Number(deal.value)
      const probability = (deal.stage?.probability ?? 50) / 100
      const baseValue = convertToBase(value, deal.currency)
      const weighted = baseValue * probability

      // Determine quarter
      const closeDate = deal.expectedCloseAt
        || new Date(deal.createdAt.getTime() + DEFAULT_CYCLE_DAYS * 24 * 60 * 60 * 1000)
      const quarter = getQuarter(closeDate)

      if (!quarterMap[quarter]) {
        quarterMap[quarter] = { weighted: 0, unweighted: 0, dealCount: 0, bySegment: {}, byCurrency: {} }
      }
      const q = quarterMap[quarter]
      q.weighted += weighted
      q.unweighted += baseValue
      q.dealCount += 1

      // By segment
      const segment = deal.dealType || 'UNKNOWN'
      if (!q.bySegment[segment]) q.bySegment[segment] = { weighted: 0, count: 0 }
      q.bySegment[segment].weighted += weighted
      q.bySegment[segment].count += 1

      // By currency
      if (!q.byCurrency[deal.currency]) q.byCurrency[deal.currency] = { weighted: 0, count: 0 }
      q.byCurrency[deal.currency].weighted += weighted
      q.byCurrency[deal.currency].count += 1
    }

    // Sort quarters and build response
    const quarters = Object.entries(quarterMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([quarter, data]) => ({
        quarter,
        weighted: Math.round(data.weighted),
        unweighted: Math.round(data.unweighted),
        dealCount: data.dealCount,
        bySegment: data.bySegment,
        byCurrency: data.byCurrency,
      }))

    const currentQuarter = getQuarter(now)
    const nextQ = new Date(now)
    nextQ.setMonth(nextQ.getMonth() + 3)
    const nextQuarter = getQuarter(nextQ)

    const thisQ = quarters.find((q) => q.quarter === currentQuarter) || { weighted: 0, unweighted: 0, dealCount: 0 }
    const nextQData = quarters.find((q) => q.quarter === nextQuarter) || { weighted: 0, unweighted: 0, dealCount: 0 }

    const pipelineTotal = {
      weighted: quarters.reduce((s, q) => s + q.weighted, 0),
      unweighted: quarters.reduce((s, q) => s + q.unweighted, 0),
      dealCount: quarters.reduce((s, q) => s + q.dealCount, 0),
    }

    return apiSuccess({
      quarters,
      thisQuarter: { weighted: thisQ.weighted, unweighted: thisQ.unweighted, dealCount: thisQ.dealCount },
      nextQuarter: { weighted: nextQData.weighted, unweighted: nextQData.unweighted, dealCount: nextQData.dealCount },
      pipelineTotal,
      baseCurrency,
    })
  } catch (error) {
    return handleApiError(error, '/api/analytics/forecast')
  }
}
