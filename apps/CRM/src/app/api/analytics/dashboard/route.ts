import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/analytics/dashboard — Dashboard KPIs + chart datasets with period comparison
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = req.nextUrl

    // Parse date range (defaults to last 30 days)
    const now = new Date()
    const toDate = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : now
    const fromDate = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

    // Previous period (same duration, shifted back)
    const durationMs = toDate.getTime() - fromDate.getTime()
    const prevFrom = new Date(fromDate.getTime() - durationMs)
    const prevTo = new Date(fromDate.getTime())

    // Scope: MEMBER sees own, MANAGER+ sees all
    const isManager = user.role === 'ADMIN' || user.role === 'MANAGER'
    const ownerFilter: Record<string, string> = isManager ? {} : { ownerId: user.id }
    const userFilter: Record<string, string> = isManager ? {} : { userId: user.id }
    const createdByFilter: Record<string, string> = isManager ? {} : { createdById: user.id }

    // ── KPIs ────────────────────────────────────────────────────────
    // Load exchange rates for multi-currency conversion
    const exchangeRates = await prisma.exchangeRate.findMany({ where: { isActive: true } })
    const baseRate = exchangeRates.find((r) => r.isBase)
    const rateMap: Record<string, number> = {}
    for (const r of exchangeRates) {
      rateMap[r.currency] = Number(r.rateToBase)
    }

    const [kpis, prevKpis] = await Promise.all([
      computeKPIs(fromDate, toDate, ownerFilter, userFilter, createdByFilter, rateMap, baseRate?.currency),
      computeKPIs(prevFrom, prevTo, ownerFilter, userFilter, createdByFilter, rateMap, baseRate?.currency),
    ])

    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 1000) / 10

    // ── Ticket KPIs ──────────────────────────────────────────────────
    const [openTickets, slaBreachedTickets, prevOpenTickets, prevSlaBreached] = await Promise.all([
      prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      prisma.supportTicket.count({
        where: {
          slaBreached: true,
          status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] },
        },
      }),
      prisma.supportTicket.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          createdAt: { lte: prevTo },
        },
      }),
      prisma.supportTicket.count({
        where: {
          slaBreached: true,
          status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] },
          createdAt: { lte: prevTo },
        },
      }),
    ])

    // ── Charts ──────────────────────────────────────────────────────
    const [
      pipelineFunnel,
      dealsOverTime,
      quotesByStatus,
      topContacts,
      campaignPerformance,
      activityByType,
    ] = await Promise.all([
      getPipelineFunnel(ownerFilter, rateMap, baseRate?.currency),
      getDealsOverTime(fromDate, toDate, ownerFilter, rateMap, baseRate?.currency),
      getQuotesByStatus(fromDate, toDate, createdByFilter),
      getTopContacts(fromDate, toDate, ownerFilter, rateMap, baseRate?.currency),
      getCampaignPerformance(fromDate, toDate, createdByFilter),
      getActivityByType(fromDate, toDate, userFilter),
    ])

    return apiSuccess({
      period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      kpis: {
        totalRevenue: kpis.totalRevenue,
        totalRevenueChange: pctChange(kpis.totalRevenue, prevKpis.totalRevenue),
        activeDeals: kpis.activeDeals,
        activeDealsChange: pctChange(kpis.activeDeals, prevKpis.activeDeals),
        newContacts: kpis.newContacts,
        newContactsChange: pctChange(kpis.newContacts, prevKpis.newContacts),
        conversionRate: kpis.conversionRate,
        conversionRateChange: pctChange(kpis.conversionRate, prevKpis.conversionRate),
        totalQuotes: kpis.totalQuotes,
        totalQuotesChange: pctChange(kpis.totalQuotes, prevKpis.totalQuotes),
        totalOrders: kpis.totalOrders,
        totalOrdersChange: pctChange(kpis.totalOrders, prevKpis.totalOrders),
        avgDealValue: kpis.avgDealValue,
        avgDealValueChange: pctChange(kpis.avgDealValue, prevKpis.avgDealValue),
        activitiesCount: kpis.activitiesCount,
        activitiesCountChange: pctChange(kpis.activitiesCount, prevKpis.activitiesCount),
        openTickets,
        openTicketsChange: pctChange(openTickets, prevOpenTickets),
        slaBreached: slaBreachedTickets,
        slaBreachedChange: pctChange(slaBreachedTickets, prevSlaBreached),
      },
      charts: {
        pipelineFunnel,
        dealsOverTime,
        quotesByStatus,
        topContacts,
        campaignPerformance,
        activityByType,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/analytics/dashboard')
    }
    return handleApiError(error, '/api/analytics/dashboard')
  }
}

// ── KPI computation ─────────────────────────────────────────────────

function convertToBase(value: number, currency: string, rateMap: Record<string, number>, baseCurrency?: string): number {
  if (!baseCurrency || currency === baseCurrency) return value
  const rate = rateMap[currency]
  if (!rate || rate === 0) return value
  // rateToBase = how many base units per 1 of this currency
  return value * rate
}

async function computeKPIs(
  from: Date,
  to: Date,
  ownerFilter: Record<string, string>,
  userFilter: Record<string, string>,
  createdByFilter: Record<string, string>,
  rateMap: Record<string, number> = {},
  baseCurrency?: string
) {
  const wonStages = await prisma.stage.findMany({
    where: { isWon: true },
    select: { id: true },
  })
  const wonStageIds = wonStages.map((s) => s.id)

  const lostStages = await prisma.stage.findMany({
    where: { isLost: true },
    select: { id: true },
  })
  const lostStageIds = lostStages.map((s) => s.id)

  const activeStages = await prisma.stage.findMany({
    where: { isWon: false, isLost: false },
    select: { id: true },
  })
  const activeStageIds = activeStages.map((s) => s.id)

  const [
    wonDeals,
    activeDeals,
    closedWon,
    closedTotal,
    newContacts,
    totalQuotes,
    totalOrders,
    activitiesCount,
  ] = await Promise.all([
    // Won deals in period → revenue
    prisma.deal.findMany({
      where: {
        stageId: { in: wonStageIds },
        closedAt: { gte: from, lte: to },
        ...ownerFilter,
      },
      select: { value: true, currency: true },
    }),

    // Active deals count
    prisma.deal.count({
      where: {
        stageId: { in: activeStageIds },
        ...ownerFilter,
      },
    }),

    // Won deals in period (for conversion)
    prisma.deal.count({
      where: {
        stageId: { in: wonStageIds },
        closedAt: { gte: from, lte: to },
        ...ownerFilter,
      },
    }),

    // Total closed deals in period (for conversion)
    prisma.deal.count({
      where: {
        stageId: { in: [...wonStageIds, ...lostStageIds] },
        closedAt: { gte: from, lte: to },
        ...ownerFilter,
      },
    }),

    // New contacts in period
    prisma.contact.count({
      where: {
        createdAt: { gte: from, lte: to },
        ...ownerFilter,
      },
    }),

    // Total quotes in period
    prisma.quote.count({
      where: {
        createdAt: { gte: from, lte: to },
        ...createdByFilter,
      },
    }),

    // Total orders in period
    prisma.salesOrder.count({
      where: {
        createdAt: { gte: from, lte: to },
        ...createdByFilter,
      },
    }),

    // Activities count
    prisma.activity.count({
      where: {
        createdAt: { gte: from, lte: to },
        ...userFilter,
      },
    }),
  ])

  const totalRevenue = wonDeals.reduce((sum, d) => sum + convertToBase(Number(d.value), d.currency, rateMap, baseCurrency), 0)
  const avgDealValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0
  const conversionRate = closedTotal > 0 ? Math.round((closedWon / closedTotal) * 1000) / 10 : 0

  return {
    totalRevenue,
    activeDeals,
    newContacts,
    conversionRate,
    totalQuotes,
    totalOrders,
    avgDealValue,
    activitiesCount,
  }
}

// ── Chart: Pipeline Funnel ──────────────────────────────────────────

async function getPipelineFunnel(ownerFilter: Record<string, string>, rateMap: Record<string, number> = {}, baseCurrency?: string) {
  const stages = await prisma.stage.findMany({
    where: { pipeline: { isDefault: true } },
    orderBy: { order: 'asc' },
    include: {
      deals: {
        where: ownerFilter,
        select: { value: true, currency: true },
      },
      _count: {
        select: {
          deals: { where: ownerFilter },
        },
      },
    },
  })

  return stages.map((stage) => ({
    stage: stage.name,
    count: stage._count.deals,
    value: stage.deals.reduce((sum, d) => sum + convertToBase(Number(d.value), d.currency, rateMap, baseCurrency), 0),
    color: stage.color,
  }))
}

// ── Chart: Deals Over Time ──────────────────────────────────────────

async function getDealsOverTime(
  from: Date,
  to: Date,
  ownerFilter: Record<string, string>,
  rateMap: Record<string, number> = {},
  baseCurrency?: string
) {
  const wonStages = await prisma.stage.findMany({
    where: { isWon: true },
    select: { id: true },
  })
  const wonStageIds = wonStages.map((s) => s.id)

  // Group by month
  const months: Array<{ month: string; won: number; lost: number; revenue: number }> = []
  const lostStages = await prisma.stage.findMany({
    where: { isLost: true },
    select: { id: true },
  })
  const lostStageIds = lostStages.map((s) => s.id)

  // Determine month range
  const startMonth = new Date(from.getFullYear(), from.getMonth(), 1)
  const endMonth = new Date(to.getFullYear(), to.getMonth() + 1, 1)

  const current = new Date(startMonth)
  while (current < endMonth) {
    const monthStart = new Date(current)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1)

    const [wonDeals, lostDeals] = await Promise.all([
      prisma.deal.findMany({
        where: {
          stageId: { in: wonStageIds },
          closedAt: { gte: monthStart, lt: monthEnd },
          ...ownerFilter,
        },
        select: { value: true, currency: true },
      }),
      prisma.deal.count({
        where: {
          stageId: { in: lostStageIds },
          closedAt: { gte: monthStart, lt: monthEnd },
          ...ownerFilter,
        },
      }),
    ])

    months.push({
      month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      won: wonDeals.length,
      lost: lostDeals,
      revenue: wonDeals.reduce((sum, d) => sum + convertToBase(Number(d.value), d.currency, rateMap, baseCurrency), 0),
    })

    current.setMonth(current.getMonth() + 1)
  }

  return months
}

// ── Chart: Quotes by Status ─────────────────────────────────────────

async function getQuotesByStatus(
  from: Date,
  to: Date,
  createdByFilter: Record<string, string>
) {
  const statuses = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as const
  const colors: Record<string, string> = {
    DRAFT: '#6B7280',
    SENT: '#3B82F6',
    VIEWED: '#8B5CF6',
    ACCEPTED: '#10B981',
    REJECTED: '#EF4444',
    EXPIRED: '#F59E0B',
  }

  const results = await Promise.all(
    statuses.map(async (status) => ({
      status,
      count: await prisma.quote.count({
        where: {
          status,
          createdAt: { gte: from, lte: to },
          ...createdByFilter,
        },
      }),
      color: colors[status],
    }))
  )

  return results.filter((r) => r.count > 0)
}

// ── Chart: Top Contacts by Deal Value ───────────────────────────────

async function getTopContacts(
  from: Date,
  to: Date,
  ownerFilter: Record<string, string>,
  rateMap: Record<string, number> = {},
  baseCurrency?: string
) {
  const wonStages = await prisma.stage.findMany({
    where: { isWon: true },
    select: { id: true },
  })
  const wonStageIds = wonStages.map((s) => s.id)

  const dealContacts = await prisma.dealContact.findMany({
    where: {
      deal: {
        stageId: { in: wonStageIds },
        closedAt: { gte: from, lte: to },
        ...ownerFilter,
      },
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true } },
      deal: { select: { value: true, currency: true } },
    },
  })

  // Aggregate by contact
  const contactMap = new Map<string, { name: string; totalValue: number; deals: number }>()
  for (const dc of dealContacts) {
    const key = dc.contact.id
    const existing = contactMap.get(key)
    const dealValue = convertToBase(Number(dc.deal.value), dc.deal.currency, rateMap, baseCurrency)
    if (existing) {
      existing.totalValue += dealValue
      existing.deals++
    } else {
      contactMap.set(key, {
        name: `${dc.contact.firstName} ${dc.contact.lastName}`.trim(),
        totalValue: dealValue,
        deals: 1,
      })
    }
  }

  return Array.from(contactMap.values())
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
}

// ── Chart: Campaign Performance ─────────────────────────────────────

async function getCampaignPerformance(
  from: Date,
  to: Date,
  createdByFilter: Record<string, string>
) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'SENT',
      sentAt: { gte: from, lte: to },
      ...createdByFilter,
    },
    select: {
      id: true,
      name: true,
      totalSent: true,
      totalOpened: true,
      totalClicked: true,
      totalBounced: true,
    },
    orderBy: { sentAt: 'desc' },
    take: 10,
  })

  return campaigns.map((c) => ({
    name: c.name,
    sent: c.totalSent,
    opened: c.totalOpened,
    clicked: c.totalClicked,
    bounced: c.totalBounced,
    openRate: c.totalSent > 0 ? Math.round((c.totalOpened / c.totalSent) * 1000) / 10 : 0,
  }))
}

// ── Chart: Activity by Type ─────────────────────────────────────────

async function getActivityByType(
  from: Date,
  to: Date,
  userFilter: Record<string, string>
) {
  const types = ['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE', 'LUNCH', 'DEMO', 'FOLLOW_UP'] as const
  const colors: Record<string, string> = {
    CALL: '#3B82F6',
    EMAIL: '#10B981',
    MEETING: '#8B5CF6',
    TASK: '#F59E0B',
    NOTE: '#6B7280',
    LUNCH: '#EC4899',
    DEMO: '#06B6D4',
    FOLLOW_UP: '#F97316',
  }

  const results = await Promise.all(
    types.map(async (type) => ({
      type,
      count: await prisma.activity.count({
        where: {
          type,
          createdAt: { gte: from, lte: to },
          ...userFilter,
        },
      }),
      color: colors[type],
    }))
  )

  return results.filter((r) => r.count > 0)
}
