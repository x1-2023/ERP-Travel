import { db } from '@/lib/db'

export async function createEvaluation(
  tenantId: string,
  data: {
    applicationId: string
    interviewId?: string
    evaluatorId: string
    technicalSkills?: number
    communication?: number
    problemSolving?: number
    cultureFit?: number
    experience?: number
    overallRating: number
    strengths?: string
    weaknesses?: string
    notes?: string
    recommendation: string
  }
) {
  const evaluation = await db.candidateEvaluation.create({
    data: {
      tenantId,
      applicationId: data.applicationId,
      interviewId: data.interviewId,
      evaluatorId: data.evaluatorId,
      technicalSkills: data.technicalSkills,
      communication: data.communication,
      problemSolving: data.problemSolving,
      cultureFit: data.cultureFit,
      experience: data.experience,
      overallRating: data.overallRating,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      notes: data.notes,
      recommendation: data.recommendation,
    },
    include: {
      evaluator: { select: { id: true, name: true } },
    },
  })

  // Update application overall rating
  const allEvaluations = await db.candidateEvaluation.findMany({
    where: { applicationId: data.applicationId },
  })

  const avgRating = allEvaluations.reduce((sum, e) => sum + Number(e.overallRating), 0) / allEvaluations.length

  await db.application.update({
    where: { id: data.applicationId },
    data: { overallRating: avgRating },
  })

  await db.applicationActivity.create({
    data: {
      applicationId: data.applicationId,
      action: 'evaluation_added',
      description: `Đánh giá từ ${evaluation.evaluator.name}: ${data.recommendation}`,
      performedById: data.evaluatorId,
    },
  })

  return evaluation
}

export async function getEvaluations(
  tenantId: string,
  filters?: {
    applicationId?: string
    interviewId?: string
    evaluatorId?: string
  }
) {
  const where: Record<string, unknown> = { tenantId }

  if (filters?.applicationId) where.applicationId = filters.applicationId
  if (filters?.interviewId) where.interviewId = filters.interviewId
  if (filters?.evaluatorId) where.evaluatorId = filters.evaluatorId

  return db.candidateEvaluation.findMany({
    where,
    include: {
      evaluator: { select: { id: true, name: true } },
      interview: true,
      application: {
        include: {
          candidate: { select: { id: true, fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
