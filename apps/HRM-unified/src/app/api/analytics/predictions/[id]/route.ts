import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { predictiveAnalyticsService } from '@/services/analytics'
import { z } from 'zod'

const recordOutcomeSchema = z.object({
  outcome: z.string().min(1),
})

// GET /api/analytics/predictions/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const prediction = await predictiveAnalyticsService.getPredictionById(
      tenantId,
      params.id
    )

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: prediction,
    })
  } catch (error) {
    console.error('Error fetching prediction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    )
  }
}

// PATCH /api/analytics/predictions/[id] - Record outcome
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin/HR roles
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()
    const data = recordOutcomeSchema.parse(body)

    const prediction = await predictiveAnalyticsService.recordOutcome(
      tenantId,
      params.id,
      data.outcome
    )

    return NextResponse.json({
      success: true,
      data: prediction,
      message: 'Outcome recorded successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error recording outcome:', error)
    return NextResponse.json(
      { error: 'Failed to record outcome' },
      { status: 500 }
    )
  }
}
