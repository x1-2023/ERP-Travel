import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const completeSchema = z.object({
  enrollmentId: z.string(),
  timeSpentMinutes: z.number().optional(),
})

// POST /api/learning/lessons/[id]/complete
// Note: This endpoint marks a course module as complete
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
    const data = completeSchema.parse(body)

    // Verify enrollment exists and belongs to user
    const enrollment = await db.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: {
        course: {
          include: {
            modules: { orderBy: { order: 'asc' } },
          },
        },
        moduleCompletions: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    if (enrollment.employeeId !== session.user.employeeId) {
      return NextResponse.json(
        { error: 'Not authorized to complete this module' },
        { status: 403 }
      )
    }

    // Verify module exists and belongs to the course
    const module = await db.courseModule.findUnique({
      where: { id: params.id },
    })

    if (!module || module.courseId !== enrollment.courseId) {
      return NextResponse.json(
        { error: 'Module not found in this course' },
        { status: 404 }
      )
    }

    // Check if already completed
    const existingCompletion = await db.moduleCompletion.findUnique({
      where: {
        enrollmentId_moduleId: {
          enrollmentId: data.enrollmentId,
          moduleId: params.id,
        },
      },
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Module already completed' },
        { status: 400 }
      )
    }

    // Create module completion
    await db.moduleCompletion.create({
      data: {
        enrollmentId: data.enrollmentId,
        moduleId: params.id,
        completedAt: new Date(),
        timeSpentMinutes: data.timeSpentMinutes,
      },
    })

    // Calculate updated progress
    const totalModules = enrollment.course.modules.length
    const completedModules = enrollment.moduleCompletions.length + 1

    const progress = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0

    const isComplete = progress === 100

    // Update enrollment progress
    const updatedEnrollment = await db.enrollment.update({
      where: { id: data.enrollmentId },
      data: {
        progress,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isComplete ? new Date() : null,
        passed: isComplete ? true : null,
        certificateIssued: isComplete,
      },
    })

    // Issue certificate if completed
    let certificate = null
    if (isComplete) {
      certificate = await db.employeeCertification.create({
        data: {
          tenantId: session.user.tenantId,
          employeeId: enrollment.employeeId,
          certificationTypeId: enrollment.courseId, // Using courseId as a reference
          certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
          issuedDate: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        moduleCompleted: true,
        enrollmentProgress: progress,
        isEnrollmentComplete: isComplete,
        certificate: certificate ? {
          id: certificate.id,
          certificateNumber: certificate.certificateNumber,
        } : null,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error completing module:', error)
    return NextResponse.json(
      { error: 'Failed to complete module' },
      { status: 500 }
    )
  }
}
