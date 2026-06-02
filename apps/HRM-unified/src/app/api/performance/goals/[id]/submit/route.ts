import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/performance/goals/[id]/submit
// Submits a goal for review (changes status from DRAFT to ACTIVE)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goal = await db.goal.findUnique({
      where: { id: params.id },
      include: {
        keyResults: true,
        owner: { select: { id: true, fullName: true, directManagerId: true } },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if user owns the goal
    if (goal.ownerId !== session.user.employeeId) {
      return NextResponse.json(
        { error: 'You can only submit your own goals' },
        { status: 403 }
      )
    }

    // Check if goal is in draft status
    if (goal.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft goals can be submitted' },
        { status: 400 }
      )
    }

    // Check if goal has key results
    if (goal.keyResults.length === 0) {
      return NextResponse.json(
        { error: 'Goal must have at least one key result before submission' },
        { status: 400 }
      )
    }

    // Update goal status to active
    const updatedGoal = await db.goal.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
      },
      include: {
        keyResults: true,
        reviewCycle: { select: { id: true, name: true } },
      },
    })

    // Create notification for manager if exists
    if (goal.owner?.directManagerId) {
      await db.notification.create({
        data: {
          tenantId: session.user.tenantId,
          userId: goal.owner.directManagerId,
          type: 'PENDING_APPROVAL',
          title: 'Mục tiêu mới cần xem xét',
          message: `${goal.owner.fullName} đã gửi mục tiêu "${goal.title}" để xem xét`,
          actionUrl: `/performance/goals/${goal.id}`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedGoal,
      message: 'Goal submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting goal:', error)
    return NextResponse.json(
      { error: 'Failed to submit goal' },
      { status: 500 }
    )
  }
}
