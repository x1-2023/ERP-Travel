import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { AuthError } from '@/lib/auth/get-current-user'

// GET /api/internal/pipeline — Revenue forecast for OTB integration (Phase 3 stub)
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const pipeline = await prisma.pipelineConfig.findFirst({
      where: { isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              select: { value: true, expectedCloseAt: true, probability: true },
            },
          },
        },
      },
    })

    if (!pipeline) {
      return NextResponse.json({ error: 'No pipeline found' }, { status: 404 })
    }

    const summary = pipeline.stages.map((stage) => {
      const totalValue = stage.deals.reduce((sum, d) => sum + Number(d.value), 0)
      const weightedValue = totalValue * (stage.probability / 100)

      return {
        stageId: stage.id,
        stageName: stage.name,
        probability: stage.probability,
        dealCount: stage.deals.length,
        totalValue,
        weightedValue,
        isWon: stage.isWon,
        isLost: stage.isLost,
      }
    })

    const totalPipelineValue = summary.reduce((sum, s) => sum + s.totalValue, 0)
    const totalWeightedValue = summary.reduce((sum, s) => sum + s.weightedValue, 0)
    const totalDeals = summary.reduce((sum, s) => sum + s.dealCount, 0)

    return NextResponse.json({
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      totalDeals,
      totalPipelineValue,
      totalWeightedValue,
      stages: summary,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/internal/pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pipeline forecast' },
      { status: 500 }
    )
  }
}
