import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/analytics/partner-performance — Partner performance metrics
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const { searchParams } = req.nextUrl
    const periodDays = parseInt(searchParams.get('period') || '365')
    const baseCurrency = searchParams.get('baseCurrency') || 'USD'

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

    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    // Get won stage IDs
    const wonStages = await prisma.stage.findMany({ where: { isWon: true }, select: { id: true } })
    const lostStages = await prisma.stage.findMany({ where: { isLost: true }, select: { id: true } })
    const wonStageIds = wonStages.map((s) => s.id)
    const lostStageIds = lostStages.map((s) => s.id)

    // Get all active partners with their deals and commissions
    const partners: any[] = await prisma.partner.findMany({
      where: { isActive: true },
      include: {
        company: { select: { id: true, name: true } },
        deals: {
          where: { createdAt: { gte: since } },
          select: { id: true, value: true, currency: true, stageId: true },
        },
        commissions: {
          where: { createdAt: { gte: since } },
          select: { amount: true, currency: true, status: true },
        },
      },
    })

    // Total all-deal revenue (for contribution calc)
    const allDealsAgg = await prisma.deal.aggregate({
      where: {
        stageId: { in: wonStageIds },
        closedAt: { gte: since },
      },
      _sum: { value: true },
    })
    const totalAllRevenue = Number(allDealsAgg._sum.value || 0)

    let totalPartnerRevenue = 0
    let totalCommissionPaid = 0
    let totalCommissionPending = 0

    const partnerStats = partners.map((p: any) => {
      const deals = p.deals as any[]
      const comms = p.commissions as any[]
      const dealCount = deals.length
      const wonDeals = deals.filter((d: any) => wonStageIds.includes(d.stageId))
      const lostDeals = deals.filter((d: any) => lostStageIds.includes(d.stageId))
      const wonCount = wonDeals.length
      const closedCount = wonCount + lostDeals.length

      const revenue = wonDeals.reduce(
        (sum: number, d: any) => sum + convertToBase(Number(d.value), d.currency),
        0
      )
      totalPartnerRevenue += revenue

      const commissionEarned = comms
        .filter((c: any) => c.status === 'PAID')
        .reduce((sum: number, c: any) => sum + convertToBase(Number(c.amount), c.currency), 0)
      totalCommissionPaid += commissionEarned

      const commissionPending = comms
        .filter((c: any) => c.status === 'PENDING' || c.status === 'APPROVED')
        .reduce((sum: number, c: any) => sum + convertToBase(Number(c.amount), c.currency), 0)
      totalCommissionPending += commissionPending

      return {
        partnerId: p.id,
        partnerName: p.company.name,
        territory: p.territory || '',
        certification: p.certificationLevel,
        dealCount,
        wonCount,
        winRate: closedCount > 0 ? Math.round((wonCount / closedCount) * 100) / 100 : 0,
        totalRevenue: Math.round(revenue),
        commissionEarned: Math.round(commissionEarned),
        commissionPending: Math.round(commissionPending),
        avgDealValue: wonCount > 0 ? Math.round(revenue / wonCount) : 0,
      }
    })

    // Sort by revenue descending
    partnerStats.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return apiSuccess({
      partners: partnerStats,
      totalPartnerRevenue: Math.round(totalPartnerRevenue),
      totalCommissionPaid: Math.round(totalCommissionPaid),
      totalCommissionPending: Math.round(totalCommissionPending),
      partnerContribution: totalAllRevenue > 0
        ? Math.round((totalPartnerRevenue / totalAllRevenue) * 100) / 100
        : 0,
      baseCurrency,
    })
  } catch (error) {
    return handleApiError(error, '/api/analytics/partner-performance')
  }
}
