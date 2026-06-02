import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const submitSchema = z.object({
  enrollmentId: z.string(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  startedAt: z.string().datetime().optional(),
})

// POST /api/learning/quizzes/[id]/submit
// Note: This endpoint submits an assessment (quiz) attempt
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
    const data = submitSchema.parse(body)

    // Get assessment with questions
    const assessment = await db.assessment.findUnique({
      where: { id: params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Verify enrollment
    const enrollment = await db.enrollment.findUnique({
      where: { id: data.enrollmentId },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.employeeId !== session.user.employeeId) {
      return NextResponse.json(
        { error: 'Not authorized to submit this assessment' },
        { status: 403 }
      )
    }

    // Check attempt count
    const attemptCount = await db.assessmentAttempt.count({
      where: {
        assessmentId: params.id,
        enrollmentId: data.enrollmentId,
      },
    })

    if (assessment.maxAttempts && attemptCount >= assessment.maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum attempts reached' },
        { status: 400 }
      )
    }

    // Calculate score
    let score = 0
    let maxScore = 0
    interface QuestionResult {
      questionId: string
      isCorrect: boolean
      userAnswer: string | string[]
      correctAnswer?: string | string[] | null
    }
    const questionResults: QuestionResult[] = []

    for (const question of assessment.questions) {
      const points = Number(question.points) || 1
      maxScore += points
      const userAnswer = data.answers[question.id]

      if (!userAnswer) {
        questionResults.push({
          questionId: question.id,
          isCorrect: false,
          userAnswer: '',
        })
        continue
      }

      let isCorrect = false
      const options = question.options as { id: string; text: string; isCorrect: boolean }[] | null

      switch (question.questionType) {
        case 'SINGLE_CHOICE':
        case 'TRUE_FALSE':
          if (options) {
            const correctOption = options.find((o) => o.isCorrect)
            isCorrect = correctOption?.id === userAnswer
          }
          break

        case 'MULTIPLE_CHOICE':
          if (options) {
            const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id).sort()
            const userIds = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).sort()
            isCorrect = JSON.stringify(correctIds) === JSON.stringify(userIds)
          }
          break

        case 'SHORT_ANSWER':
        case 'ESSAY':
          // For short answers, check exact match (case-insensitive)
          if (question.correctAnswer) {
            isCorrect = String(question.correctAnswer).toLowerCase().trim() ===
                        String(userAnswer).toLowerCase().trim()
          }
          break
      }

      if (isCorrect) {
        score += points
      }

      questionResults.push({
        questionId: question.id,
        isCorrect,
        userAnswer: userAnswer as string | string[],
        correctAnswer: question.correctAnswer,
      })
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
    const passed = percentage >= (Number(assessment.passingScore) || 70)

    // Create attempt record
    const attempt = await db.assessmentAttempt.create({
      data: {
        tenantId: session.user.tenantId,
        assessmentId: params.id,
        employeeId: session.user.employeeId!,
        enrollmentId: data.enrollmentId,
        attemptNumber: attemptCount + 1,
        startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
        submittedAt: new Date(),
        score: score,
        percentageScore: percentage,
        passed,
      },
    })

    // Create question responses
    for (const result of questionResults) {
      await db.questionResponse.create({
        data: {
          attemptId: attempt.id,
          questionId: result.questionId,
          response: typeof result.userAnswer === 'string'
            ? result.userAnswer
            : null,
          selectedOptions: Array.isArray(result.userAnswer)
            ? result.userAnswer
            : undefined,
          isCorrect: result.isCorrect,
          pointsEarned: result.isCorrect
            ? Number(assessment.questions.find(q => q.id === result.questionId)?.points) || 1
            : 0,
        },
      })
    }

    // Update enrollment score if this is a final assessment
    if (passed) {
      await db.enrollment.update({
        where: { id: data.enrollmentId },
        data: {
          score: percentage,
          passed: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        attemptsRemaining: assessment.maxAttempts
          ? assessment.maxAttempts - attemptCount - 1
          : null,
        results: assessment.showCorrectAnswers ? {
          questions: questionResults.map((qr, idx) => ({
            questionId: qr.questionId,
            questionText: assessment.questions[idx].questionText,
            isCorrect: qr.isCorrect,
            userAnswer: qr.userAnswer,
          })),
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
    console.error('Error submitting assessment:', error)
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}
