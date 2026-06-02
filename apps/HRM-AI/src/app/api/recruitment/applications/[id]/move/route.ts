import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const moveSchema = z.object({
  status: z.enum([
    'NEW',
    'SCREENING',
    'PHONE_SCREEN',
    'INTERVIEW',
    'ASSESSMENT',
    'OFFER',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ]),
  notes: z.string().optional(),
})

// POST /api/recruitment/applications/[id]/move
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
    const data = moveSchema.parse(body)

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        candidate: { select: { fullName: true, email: true } },
        requisition: { select: { title: true } },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const previousStatus = application.status

    // Update application status
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        status: data.status,
        hiredAt: data.status === 'HIRED' ? new Date() : application.hiredAt,
        hiredById: data.status === 'HIRED' ? session.user.id : application.hiredById,
        rejectedAt: data.status === 'REJECTED' ? new Date() : application.rejectedAt,
        rejectedById: data.status === 'REJECTED' ? session.user.id : application.rejectedById,
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
        action: 'stage_changed',
        description: `Chuyển từ "${previousStatus}" sang "${data.status}"${data.notes ? `: ${data.notes}` : ''}`,
        oldValue: previousStatus,
        newValue: data.status,
        performedById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application moved to ${data.status}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error moving application:', error)
    return NextResponse.json(
      { error: 'Failed to move application' },
      { status: 500 }
    )
  }
}
