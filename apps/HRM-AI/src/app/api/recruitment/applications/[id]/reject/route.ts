import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  sendNotification: z.boolean().optional().default(true),
})

// POST /api/recruitment/applications/[id]/reject
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
    const data = rejectSchema.parse(body)

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        candidate: { select: { id: true, fullName: true, email: true } },
        requisition: { select: { id: true, title: true } },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Application is already rejected' },
        { status: 400 }
      )
    }

    // Update application status to rejected
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedById: session.user.id,
        rejectionReason: data.reason,
      },
      include: {
        candidate: true,
        requisition: { select: { id: true, title: true, requisitionCode: true } },
      },
    })

    // Log the activity
    await db.applicationActivity.create({
      data: {
        applicationId: params.id,
        action: 'rejected',
        description: `Từ chối hồ sơ: ${data.reason}`,
        newValue: 'REJECTED',
        performedById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application rejected successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error rejecting application:', error)
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    )
  }
}
