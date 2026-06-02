// src/app/api/ai/predictions/turnover/route.ts
// Turnover Prediction API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createTurnoverPredictor } from '@/lib/ai/predictions'
import { z } from 'zod'

const querySchema = z.object({
  departmentId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role - only HR and Admin can access predictions
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check AI configuration
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 503 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const params = querySchema.parse({
      departmentId: searchParams.get('departmentId'),
      limit: searchParams.get('limit')
    })

    // Create predictor and run analysis
    const predictor = createTurnoverPredictor(session.user.tenantId)
    const result = await predictor.analyzeTurnoverRisk({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      departmentId: params.departmentId,
      limit: params.limit
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Turnover prediction error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}

// Get single employee prediction
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    if (!['ADMIN', 'HR_MANAGER', 'HR_STAFF', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { employeeId } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // For now, use the bulk analysis and filter
    const predictor = createTurnoverPredictor(session.user.tenantId)
    const result = await predictor.analyzeTurnoverRisk({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      limit: 200
    })

    const prediction = result.predictions.find(p => p.employeeId === employeeId)

    if (!prediction) {
      return NextResponse.json(
        { error: 'Employee not found or not eligible for analysis' },
        { status: 404 }
      )
    }

    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Single prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
