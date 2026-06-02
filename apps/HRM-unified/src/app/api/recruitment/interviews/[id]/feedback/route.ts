import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const feedbackSchema = z.object({
  overallRating: z.number().min(1).max(5),
  recommendation: z.enum(['STRONG_YES', 'YES', 'NEUTRAL', 'NO', 'STRONG_NO']),
  technicalSkills: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  problemSolving: z.number().int().min(1).max(5).optional(),
  cultureFit: z.number().int().min(1).max(5).optional(),
  experience: z.number().int().min(1).max(5).optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/recruitment/interviews/[id]/feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get evaluations for this interview using CandidateEvaluation
    const evaluations = await db.candidateEvaluation.findMany({
      where: { interviewId: params.id },
      include: {
        evaluator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: evaluations,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST /api/recruitment/interviews/[id]/feedback
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
    const data = feedbackSchema.parse(body)

    // Check if interview exists
    const interview = await db.interview.findUnique({
      where: { id: params.id },
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Check if user is in the interviewerIds list
    const interviewerIds = interview.interviewerIds as string[]
    const isInterviewer = interviewerIds?.includes(session.user.id)

    if (!isInterviewer) {
      return NextResponse.json(
        { error: 'You are not assigned to this interview' },
        { status: 403 }
      )
    }

    // Check if already submitted feedback
    const existingEvaluation = await db.candidateEvaluation.findFirst({
      where: {
        interviewId: params.id,
        evaluatorId: session.user.id,
      },
    })

    if (existingEvaluation) {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this interview' },
        { status: 400 }
      )
    }

    // Create evaluation
    const evaluation = await db.candidateEvaluation.create({
      data: {
        tenantId: session.user.tenantId,
        applicationId: interview.applicationId,
        interviewId: params.id,
        evaluatorId: session.user.id,
        overallRating: data.overallRating,
        recommendation: data.recommendation,
        technicalSkills: data.technicalSkills,
        communication: data.communication,
        problemSolving: data.problemSolving,
        cultureFit: data.cultureFit,
        experience: data.experience,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        notes: data.notes,
      },
      include: {
        evaluator: {
          select: { id: true, name: true },
        },
      },
    })

    // Check if all interviewers have submitted feedback
    const totalEvaluations = await db.candidateEvaluation.count({
      where: { interviewId: params.id },
    })

    const totalInterviewers = interviewerIds?.length || 0

    if (totalEvaluations >= totalInterviewers) {
      // Mark interview as passed (or determine based on evaluations)
      await db.interview.update({
        where: { id: params.id },
        data: { result: 'PASSED' },
      })
    }

    // Log activity
    await db.applicationActivity.create({
      data: {
        applicationId: interview.applicationId,
        action: 'feedback_submitted',
        description: `Feedback phỏng vấn - Điểm: ${data.overallRating}/5, Đề xuất: ${data.recommendation}`,
        performedById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: evaluation,
      message: 'Feedback submitted successfully',
    }, { status: 201 })
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
