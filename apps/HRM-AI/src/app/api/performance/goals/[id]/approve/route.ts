import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const approveSchema = z.object({
  approved: z.boolean(),
  feedback: z.string().optional(),
})

// POST /api/performance/goals/[id]/approve
// Manager reviews and approves/rejects a goal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = approveSchema.parse(body)

    const goal = await db.goal.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true, fullName: true, directManagerId: true } },
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if user is the manager of the goal owner
    if (goal.owner?.directManagerId !== session.user.employeeId) {
      return NextResponse.json(
        { error: 'Only the manager can approve/reject goals' },
        { status: 403 }
      )
    }

    // Check if goal is active (submitted for review)
    if (goal.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Goal is not pending approval' },
        { status: 400 }
      )
    }

    // Update goal status
    const newStatus = data.approved ? 'ACTIVE' : 'DRAFT'
    const updatedGoal = await db.goal.update({
      where: { id: params.id },
      data: {
        status: newStatus,
      },
      include: {
        keyResults: true,
        reviewCycle: { select: { id: true, name: true } },
      },
    })

    // Log the update
    await db.goalUpdate.create({
      data: {
        goalId: params.id,
        notes: data.approved
          ? `Goal approved by manager${data.feedback ? `: ${data.feedback}` : ''}`
          : `Goal returned for revision${data.feedback ? `: ${data.feedback}` : ''}`,
        updatedById: session.user.id,
      },
    })

    // Create notification for employee
    if (goal.ownerId) {
      await db.notification.create({
        data: {
          tenantId: session.user.tenantId,
          userId: goal.ownerId,
          type: data.approved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
          title: data.approved ? 'Mục tiêu được phê duyệt' : 'Mục tiêu cần chỉnh sửa',
          message: data.approved
            ? `Mục tiêu "${goal.title}" đã được phê duyệt`
            : `Mục tiêu "${goal.title}" cần chỉnh sửa: ${data.feedback || 'Không có ghi chú'}`,
          actionUrl: `/performance/goals/${goal.id}`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedGoal,
      message: data.approved ? 'Goal approved' : 'Goal sent back for revision',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error approving goal:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
