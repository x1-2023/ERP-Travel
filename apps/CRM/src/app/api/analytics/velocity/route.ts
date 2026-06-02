import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/analytics/velocity — Deal velocity metrics
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const { searchParams } = req.nextUrl
    const periodDays = parseInt(searchParams.get('period') || '180')
    const segment = searchParams.get('segment')

    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    // Get all stages in order
    const stages = await prisma.stage.findMany({
      where: { isLost: false },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true, isWon: true },
    })

    // Get won deals in period (for cycle time calculation)
    const wonStageIds = stages.filter((s) => s.isWon).map((s) => s.id)
    const whereBase: Record<string, unknown> = {
      closedAt: { gte: since },
      stageId: { in: wonStageIds },
    }
    if (segment) (whereBase as any).dealType = segment

    const wonDeals = await prisma.deal.findMany({
      where: whereBase as any,
      select: { id: true, createdAt: true, closedAt: true },
    })

    // Calculate average sales cycle (days from created to closed won)
    const cycleDays = wonDeals
      .filter((d) => d.closedAt)
      .map((d) => Math.floor((d.closedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24)))

    const avgCycleDays = cycleDays.length > 0
      ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length)
      : 0

    const sortedCycle = [...cycleDays].sort((a, b) => a - b)
    const medianCycleDays = sortedCycle.length > 0
      ? sortedCycle[Math.floor(sortedCycle.length / 2)]
      : 0

    // Stage velocity: estimate avg days per stage
    // Using deals currently at each stage (simplified: deal age / stage order position)
    const nonClosedStages = stages.filter((s) => !s.isWon)

    const stageVelocity: Array<{ stage: string; avgDays: number; dealCount: number }> = []
    let maxAvgDays = 0
    let bottleneck = ''

    for (const stage of nonClosedStages) {
      const whereStage: Record<string, unknown> = {
        stageId: stage.id,
        createdAt: { gte: since },
      }
      if (segment) (whereStage as any).dealType = segment

      const dealsAtStage = await prisma.deal.findMany({
        where: whereStage as any,
        select: { createdAt: true, updatedAt: true },
      })

      // Estimate time at stage: use updatedAt - createdAt / (position + 1)
      // This is a simplification since we don't have stage history
      const stagePosition = stage.order + 1
      const avgDays = dealsAtStage.length > 0
        ? Math.round(
            dealsAtStage.reduce((sum, d) => {
              const totalDays = Math.floor((d.updatedAt.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24))
              return sum + Math.max(1, Math.round(totalDays / stagePosition))
            }, 0) / dealsAtStage.length
          )
        : 0

      stageVelocity.push({ stage: stage.name, avgDays, dealCount: dealsAtStage.length })

      if (avgDays > maxAvgDays && dealsAtStage.length > 0) {
        maxAvgDays = avgDays
        bottleneck = stage.name
      }
    }

    // Conversion rates between consecutive stages
    const conversionRates: Array<{ from: string; to: string; rate: number }> = []
    for (let i = 0; i < stageVelocity.length - 1; i++) {
      const fromCount = stageVelocity[i].dealCount
      const toCount = stageVelocity[i + 1].dealCount
      conversionRates.push({
        from: stageVelocity[i].stage,
        to: stageVelocity[i + 1].stage,
        rate: fromCount > 0 ? Math.round((toCount / fromCount) * 100) / 100 : 0,
      })
    }

    // Add final conversion to Won
    if (stageVelocity.length > 0) {
      const lastStage = stageVelocity[stageVelocity.length - 1]
      conversionRates.push({
        from: lastStage.stage,
        to: 'Closed Won',
        rate: lastStage.dealCount > 0 ? Math.round((wonDeals.length / lastStage.dealCount) * 100) / 100 : 0,
      })
    }

    return apiSuccess({
      stageVelocity,
      conversionRates,
      avgCycleDays,
      medianCycleDays,
      bottleneck: bottleneck || (stageVelocity[0]?.stage ?? ''),
      wonDealsCount: wonDeals.length,
    })
  } catch (error) {
    return handleApiError(error, '/api/analytics/velocity')
  }
}
