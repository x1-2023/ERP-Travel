import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { getCountryRegion, getCountryName } from '@/lib/constants'

// GET /api/analytics/geo — Geographic revenue breakdown
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const { searchParams } = req.nextUrl
    const periodDays = parseInt(searchParams.get('period') || '365')
    const baseCurrency = searchParams.get('baseCurrency') || 'USD'
    const status = searchParams.get('status') || 'all' // all, won, open

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

    const since = periodDays > 0 ? new Date() : undefined
    if (since) since.setDate(since.getDate() - periodDays)

    // Get won and lost stage IDs
    const wonStages = await prisma.stage.findMany({ where: { isWon: true }, select: { id: true } })
    const lostStages = await prisma.stage.findMany({ where: { isLost: true }, select: { id: true } })
    const wonStageIds = wonStages.map((s) => s.id)
    const lostStageIds = lostStages.map((s) => s.id)

    // Build where clause
    const whereBase: Record<string, unknown> = {}
    if (since) whereBase.createdAt = { gte: since }
    if (status === 'won') whereBase.stageId = { in: wonStageIds }
    else if (status === 'open') whereBase.stageId = { notIn: [...wonStageIds, ...lostStageIds] }

    // Fetch deals with company
    const deals: any[] = await prisma.deal.findMany({
      where: whereBase as any,
      include: {
        company: { select: { country: true } },
        contacts: {
          take: 1,
          where: { isPrimary: true },
          include: { contact: { select: { country: true } } },
        },
      },
    })

    // Aggregate by country
    const countryMap: Record<string, {
      dealCount: number
      pipelineValue: number
      wonValue: number
      deals: number
    }> = {}

    // Segment matrix
    const matrixMap: Record<string, { dealCount: number; value: number }> = {}

    for (const deal of deals) {
      const country = deal.company?.country
        || deal.contacts?.[0]?.contact?.country
        || 'Unknown'
      const value = convertToBase(Number(deal.value), deal.currency)
      const isWon = wonStageIds.includes(deal.stageId)
      const isOpen = !wonStageIds.includes(deal.stageId) && !lostStageIds.includes(deal.stageId)

      if (!countryMap[country]) {
        countryMap[country] = { dealCount: 0, pipelineValue: 0, wonValue: 0, deals: 0 }
      }
      countryMap[country].dealCount += 1
      if (isWon) countryMap[country].wonValue += value
      if (isOpen) countryMap[country].pipelineValue += value

      // Matrix: country × segment
      const segment = deal.dealType || 'UNKNOWN'
      const matrixKey = `${country}::${segment}`
      if (!matrixMap[matrixKey]) matrixMap[matrixKey] = { dealCount: 0, value: 0 }
      matrixMap[matrixKey].dealCount += 1
      matrixMap[matrixKey].value += value
    }

    // Build byCountry response
    const byCountry = Object.entries(countryMap)
      .map(([country, data]) => {
        const total = data.pipelineValue + data.wonValue
        return {
          country,
          countryName: getCountryName(country),
          region: getCountryRegion(country),
          dealCount: data.dealCount,
          pipelineValue: Math.round(data.pipelineValue),
          wonValue: Math.round(data.wonValue),
          avgDealValue: data.dealCount > 0 ? Math.round(total / data.dealCount) : 0,
          winRate: data.dealCount > 0
            ? Math.round((data.wonValue > 0 ? 1 : 0) * 100) / 100
            : 0,
        }
      })
      .sort((a, b) => (b.pipelineValue + b.wonValue) - (a.pipelineValue + a.wonValue))

    // Recalculate win rate properly using won vs total closed
    const dealsByCountry: Record<string, { won: number; total: number }> = {}
    for (const deal of deals) {
      const country = deal.company?.country
        || deal.contacts?.[0]?.contact?.country
        || 'Unknown'
      const isWon = wonStageIds.includes(deal.stageId)
      const isLost = lostStageIds.includes(deal.stageId)
      if (!dealsByCountry[country]) dealsByCountry[country] = { won: 0, total: 0 }
      if (isWon || isLost) {
        dealsByCountry[country].total += 1
        if (isWon) dealsByCountry[country].won += 1
      }
    }
    for (const entry of byCountry) {
      const wr = dealsByCountry[entry.country]
      entry.winRate = wr && wr.total > 0
        ? Math.round((wr.won / wr.total) * 100) / 100
        : 0
    }

    // Build byRegion
    const regionMap: Record<string, { dealCount: number; totalValue: number; wonValue: number }> = {}
    for (const entry of byCountry) {
      const region = entry.region
      if (!regionMap[region]) regionMap[region] = { dealCount: 0, totalValue: 0, wonValue: 0 }
      regionMap[region].dealCount += entry.dealCount
      regionMap[region].totalValue += entry.pipelineValue + entry.wonValue
      regionMap[region].wonValue += entry.wonValue
    }
    const byRegion = Object.entries(regionMap)
      .map(([region, data]) => ({
        region,
        dealCount: data.dealCount,
        totalValue: Math.round(data.totalValue),
        wonValue: Math.round(data.wonValue),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)

    // Build matrix
    const matrix = Object.entries(matrixMap)
      .map(([key, data]) => {
        const [country, segment] = key.split('::')
        return {
          country,
          segment,
          dealCount: data.dealCount,
          value: Math.round(data.value),
        }
      })
      .sort((a, b) => b.value - a.value)

    // Top 5 countries
    const topCountries = byCountry.slice(0, 5).map((c) => c.country)

    return apiSuccess({
      byCountry,
      byRegion,
      matrix,
      topCountries,
      baseCurrency,
    })
  } catch (error) {
    return handleApiError(error, '/api/analytics/geo')
  }
}
