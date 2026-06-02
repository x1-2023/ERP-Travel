import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api/errors'

// GET /api/reports — Dashboard stats and report data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const type = searchParams.get('type') || 'dashboard'

    switch (type) {
      case 'dashboard':
        return NextResponse.json(await getDashboardStats())
      case 'funnel':
        return NextResponse.json(await getFunnelData())
      case 'revenue':
        return NextResponse.json(await getRevenueData())
      default:
        return NextResponse.json(
          { error: 'Invalid report type. Use: dashboard, funnel, revenue' },
          { status: 400 }
        )
    }
  } catch (error) {
    return handleApiError(error, '/api/reports')
  }
}

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Active deals (not in won/lost stages)
  const activeStages = await prisma.stage.findMany({
    where: { isWon: false, isLost: false },
    select: { id: true },
  })
  const activeStageIds = activeStages.map((s) => s.id)

  const [activeDeals, pipelineValueResult, wonThisMonth, totalDeals, wonDeals] = await Promise.all([
    // Count active deals
    prisma.deal.count({
      where: { stageId: { in: activeStageIds } },
    }),

    // Sum of active pipeline value
    prisma.deal.aggregate({
      where: { stageId: { in: activeStageIds } },
      _sum: { value: true },
    }),

    // Deals won this month
    prisma.deal.findMany({
      where: {
        stage: { isWon: true },
        closedAt: { gte: startOfMonth },
      },
      select: { value: true },
    }),

    // Total closed deals (for conversion rate)
    prisma.deal.count({
      where: {
        OR: [
          { stage: { isWon: true } },
          { stage: { isLost: true } },
        ],
      },
    }),

    // Won deals count
    prisma.deal.count({
      where: { stage: { isWon: true } },
    }),
  ])

  const pipelineValue = Number(pipelineValueResult._sum.value || 0)
  const wonThisMonthValue = wonThisMonth.reduce((sum, d) => sum + Number(d.value), 0)
  const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0

  return {
    activeDeals,
    activeDealsChange: 0,
    pipelineValue,
    pipelineValueChange: 0,
    wonThisMonth: wonThisMonth.length,
    wonRevenue: wonThisMonthValue,
    conversionRate,
    conversionRateChange: 0,
  }
}

async function getFunnelData() {
  const stages = await prisma.stage.findMany({
    where: {
      pipeline: { isDefault: true },
    },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { deals: true } },
      deals: {
        select: { value: true },
      },
    },
  })

  return stages.map((stage) => ({
    stage: stage.name,
    stageId: stage.id,
    count: stage._count.deals,
    value: stage.deals.reduce((sum, d) => sum + Number(d.value), 0),
    color: stage.color,
    probability: stage.probability,
    isWon: stage.isWon,
    isLost: stage.isLost,
  }))
}

async function getRevenueData() {
  const now = new Date()
  const months: { month: string; revenue: number; deals: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const wonDeals = await prisma.deal.findMany({
      where: {
        stage: { isWon: true },
        closedAt: { gte: start, lt: end },
      },
      select: { value: true },
    })

    const monthLabel = start.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })

    months.push({
      month: monthLabel,
      revenue: wonDeals.reduce((sum, d) => sum + Number(d.value), 0),
      deals: wonDeals.length,
    })
  }

  return months
}
