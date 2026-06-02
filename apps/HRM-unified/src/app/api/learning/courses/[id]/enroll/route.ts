import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const enrollSchema = z.object({
  sessionId: z.string().optional(),
})

// POST /api/learning/courses/[id]/enroll
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
    const data = enrollSchema.parse(body)

    const employeeId = session.user.employeeId!
    const tenantId = session.user.tenantId

    // Check if course exists and is published
    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        courseId: params.id,
        employeeId,
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Check session capacity if specified
    if (data.sessionId) {
      const trainingSession = await db.trainingSession.findUnique({
        where: { id: data.sessionId },
        include: {
          _count: { select: { enrollments: true } },
        },
      })

      if (!trainingSession) {
        return NextResponse.json(
          { error: 'Training session not found' },
          { status: 404 }
        )
      }

      if (trainingSession._count.enrollments >= trainingSession.maxParticipants) {
        return NextResponse.json(
          { error: 'Session is full' },
          { status: 400 }
        )
      }
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        tenantId,
        courseId: params.id,
        employeeId,
        sessionId: data.sessionId,
        status: 'ENROLLED',
        startedAt: new Date(),
        progress: 0,
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        employee: {
          select: { id: true, fullName: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrolled successfully',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
}
