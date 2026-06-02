import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pipeline — Get default pipeline with stages and deals (for Kanban)
export async function GET(req: NextRequest) {
  try {
    const pipeline = await prisma.pipelineConfig.findFirst({
      where: { isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              orderBy: { updatedAt: 'desc' },
              include: {
                stage: { select: { id: true, name: true, color: true } },
                company: { select: { id: true, name: true } },
                contacts: {
                  include: {
                    contact: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
                owner: { select: { id: true, name: true, avatarUrl: true } },
                _count: { select: { activities: true } },
              },
            },
          },
        },
      },
    })

    if (!pipeline) {
      return NextResponse.json(
        { error: 'No default pipeline found' },
        { status: 404 }
      )
    }

    // Add computed totals per stage
    const stagesWithTotals = pipeline.stages.map((stage) => ({
      ...stage,
      totalValue: stage.deals.reduce((sum, d) => sum + Number(d.value), 0),
      dealCount: stage.deals.length,
    }))

    return NextResponse.json({
      ...pipeline,
      stages: stagesWithTotals,
    })
  } catch (error) {
    console.error('GET /api/pipeline error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
      { status: 500 }
    )
  }
}
