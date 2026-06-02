import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateKRSchema = z.object({
  currentValue: z.number(),
  note: z.string().optional(),
})

// GET /api/performance/goals/[id]/key-results/[krId]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; krId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keyResult = await db.keyResult.findUnique({
      where: { id: params.krId },
      include: {
        goal: { select: { id: true, title: true, ownerId: true } },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            updatedBy: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!keyResult) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: keyResult,
    })
  } catch (error) {
    console.error('Error fetching key result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch key result' },
      { status: 500 }
    )
  }
}

// PUT /api/performance/goals/[id]/key-results/[krId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; krId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateKRSchema.parse(body)

    // Get key result with goal
    const keyResult = await db.keyResult.findUnique({
      where: { id: params.krId },
      include: {
        goal: { select: { id: true, ownerId: true, status: true, endDate: true } },
      },
    })

    if (!keyResult) {
      return NextResponse.json({ error: 'Key result not found' }, { status: 404 })
    }

    // Check if user owns the goal
    if (keyResult.goal.ownerId !== session.user.employeeId) {
      return NextResponse.json(
        { error: 'You can only update your own key results' },
        { status: 403 }
      )
    }

    // Calculate progress (assuming start value is 0 if not tracked)
    const targetValue = Number(keyResult.targetValue)
    const currentValue = data.currentValue
    const progress = targetValue !== 0 ? Math.round((currentValue / targetValue) * 100) : 0
    const clampedProgress = Math.min(100, Math.max(0, progress))

    // Update key result
    const updatedKR = await db.keyResult.update({
      where: { id: params.krId },
      data: {
        currentValue: data.currentValue,
        progress: clampedProgress,
        completedAt: clampedProgress >= 100 ? new Date() : null,
      },
    })

    // Log the update
    await db.keyResultUpdate.create({
      data: {
        keyResultId: params.krId,
        previousValue: keyResult.currentValue,
        newValue: data.currentValue,
        notes: data.note,
        updatedById: session.user.id,
      },
    })

    // Update goal progress
    const allKeyResults = await db.keyResult.findMany({
      where: { goalId: params.id },
    })

    if (allKeyResults.length > 0) {
      const totalWeight = allKeyResults.reduce((sum, kr) => sum + Number(kr.weight), 0)
      const weightedProgress = allKeyResults.reduce(
        (sum, kr) => sum + (kr.progress * Number(kr.weight)),
        0
      )
      const goalProgress = Math.round(weightedProgress / totalWeight)

      // Determine goal status based on progress
      let goalStatus = keyResult.goal.status
      if (goalProgress === 100) {
        goalStatus = 'COMPLETED'
      }

      await db.goal.update({
        where: { id: params.id },
        data: {
          progress: goalProgress,
          status: goalStatus,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedKR,
      message: 'Key result updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating key result:', error)
    return NextResponse.json(
      { error: 'Failed to update key result' },
      { status: 500 }
    )
  }
}
