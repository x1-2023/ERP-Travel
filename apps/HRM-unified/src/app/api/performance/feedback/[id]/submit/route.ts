import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const submitFeedbackSchema = z.object({
  ratings: z.record(z.string(), z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  })).optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  comments: z.string().optional(),
})

// POST /api/performance/feedback/[id]/submit
// Submits a 360 feedback response for a feedback request
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
    const data = submitFeedbackSchema.parse(body)

    // Get feedback request
    const feedbackRequest = await db.feedbackRequest.findUnique({
      where: { id: params.id },
      include: {
        subject: { select: { id: true, fullName: true } },
        review: { select: { id: true, employeeId: true } },
      },
    })

    if (!feedbackRequest) {
      return NextResponse.json({ error: 'Feedback request not found' }, { status: 404 })
    }

    // Check if user is the provider
    if (feedbackRequest.providerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to submit this feedback' },
        { status: 403 }
      )
    }

    // Check status
    if (feedbackRequest.status === 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Feedback has already been submitted' },
        { status: 400 }
      )
    }

    // Create feedback response
    const feedback = await db.feedback.create({
      data: {
        tenantId: session.user.tenantId,
        requestId: params.id,
        providerId: session.user.id,
        subjectId: feedbackRequest.subjectId,
        feedbackType: feedbackRequest.feedbackType,
        overallRating: data.overallRating,
        ratings: data.ratings,
        strengths: data.strengths,
        areasForImprovement: data.areasForImprovement,
        comments: data.comments,
        isAnonymous: false,
      },
    })

    // Update feedback request status
    await db.feedbackRequest.update({
      where: { id: params.id },
      data: {
        status: 'SUBMITTED',
        respondedAt: new Date(),
      },
    })

    // Check if all feedback for this review has been submitted
    if (feedbackRequest.reviewId) {
      const pendingFeedback = await db.feedbackRequest.count({
        where: {
          reviewId: feedbackRequest.reviewId,
          status: { in: ['REQUESTED', 'PENDING'] },
        },
      })

      // If all feedback is submitted, could update review status here
      // but this depends on the business logic
    }

    // Create notification for the subject (if not anonymous)
    await db.notification.create({
      data: {
        tenantId: session.user.tenantId,
        userId: feedbackRequest.subjectId,
        type: 'GENERAL',
        title: 'Nhận được feedback mới',
        message: `Bạn đã nhận được feedback 360° từ một đồng nghiệp`,
        actionUrl: feedbackRequest.reviewId
          ? `/performance/reviews/${feedbackRequest.reviewId}`
          : `/performance/feedback`,
      },
    })

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
