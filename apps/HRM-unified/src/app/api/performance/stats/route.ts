import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/performance/stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'personal' // 'personal' or 'team' or 'org'
    const employeeId = session.user.employeeId
    const tenantId = session.user.tenantId

    // Get current active review cycle (IN_PROGRESS)
    const currentCycle = await db.reviewCycle.findFirst({
      where: { tenantId, status: 'IN_PROGRESS' },
      orderBy: { startDate: 'desc' },
    })

    if (scope === 'personal') {
      const cycleFilter = currentCycle ? { reviewCycleId: currentCycle.id } : {}

      const [
        activeGoals,
        completedGoals,
        pendingReviews,
        pendingFeedback,
        goals,
        latestReview,
      ] = await Promise.all([
        // Active goals
        db.goal.count({
          where: {
            ownerId: employeeId,
            status: 'ACTIVE',
            ...cycleFilter,
          },
        }),

        // Completed goals
        db.goal.count({
          where: {
            ownerId: employeeId,
            status: 'COMPLETED',
            ...cycleFilter,
          },
        }),

        // Pending reviews (as employee)
        db.performanceReview.count({
          where: {
            employeeId,
            status: { in: ['NOT_STARTED', 'SELF_REVIEW_PENDING'] },
          },
        }),

        // Pending feedback to give
        db.feedbackRequest.count({
          where: {
            providerId: session.user.id,
            status: { in: ['REQUESTED', 'PENDING'] },
          },
        }),

        // Goals for progress calculation
        db.goal.findMany({
          where: {
            ownerId: employeeId,
            status: { in: ['ACTIVE', 'COMPLETED'] },
            ...cycleFilter,
          },
          select: { progress: true, status: true },
        }),

        // Latest review with rating
        db.performanceReview.findFirst({
          where: {
            employeeId,
            status: 'ACKNOWLEDGED',
            finalRating: { not: null },
          },
          orderBy: { updatedAt: 'desc' },
          select: { finalRating: true, overallScore: true },
        }),
      ])

      // Calculate overall progress
      const overallProgress = goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
        : 0

      // Goals by status
      const goalsByStatus = {
        active: goals.filter((g) => g.status === 'ACTIVE').length,
        completed: goals.filter((g) => g.status === 'COMPLETED').length,
      }

      return NextResponse.json({
        success: true,
        data: {
          activeGoals,
          completedGoals,
          overallProgress,
          pendingReviews,
          pendingFeedback,
          currentRating: latestReview?.finalRating || null,
          overallScore: latestReview?.overallScore
            ? Number(latestReview.overallScore)
            : null,
          goalsByStatus,
          currentCycle: currentCycle ? {
            id: currentCycle.id,
            name: currentCycle.name,
            endDate: currentCycle.endDate,
          } : null,
        },
      })
    } else if (scope === 'team') {
      // Team stats (for managers)
      const teamMembers = await db.employee.findMany({
        where: { directManagerId: employeeId, tenantId },
        select: { id: true },
      })

      const teamMemberIds = teamMembers.map((m) => m.id)
      const cycleFilter = currentCycle ? { reviewCycleId: currentCycle.id } : {}

      const [
        teamGoals,
        pendingApprovals,
        teamReviews,
        teamFeedbackPending,
      ] = await Promise.all([
        db.goal.findMany({
          where: {
            ownerId: { in: teamMemberIds },
            ...cycleFilter,
          },
          select: { status: true, progress: true },
        }),

        db.goal.count({
          where: {
            ownerId: { in: teamMemberIds },
            status: 'DRAFT',
          },
        }),

        db.performanceReview.count({
          where: {
            employeeId: { in: teamMemberIds },
            status: { in: ['SELF_REVIEW_DONE', 'MANAGER_REVIEW_PENDING'] },
          },
        }),

        db.feedbackRequest.count({
          where: {
            subjectId: { in: teamMemberIds },
            status: { in: ['REQUESTED', 'PENDING'] },
          },
        }),
      ])

      const teamAvgProgress = teamGoals.length > 0
        ? Math.round(teamGoals.reduce((sum, g) => sum + g.progress, 0) / teamGoals.length)
        : 0

      return NextResponse.json({
        success: true,
        data: {
          teamSize: teamMembers.length,
          teamAvgProgress,
          pendingApprovals,
          teamReviewsPending: teamReviews,
          teamFeedbackPending,
          teamGoalsByStatus: {
            active: teamGoals.filter((g) => g.status === 'ACTIVE').length,
            completed: teamGoals.filter((g) => g.status === 'COMPLETED').length,
            draft: teamGoals.filter((g) => g.status === 'DRAFT').length,
          },
          currentCycle: currentCycle ? {
            id: currentCycle.id,
            name: currentCycle.name,
          } : null,
        },
      })
    } else {
      // Organization stats
      const cycleFilter = currentCycle ? { reviewCycleId: currentCycle.id } : {}

      const [
        totalGoals,
        completedGoals,
        totalReviews,
        completedReviews,
        avgGoalProgress,
      ] = await Promise.all([
        db.goal.count({
          where: { tenantId, ...cycleFilter },
        }),

        db.goal.count({
          where: {
            tenantId,
            status: 'COMPLETED',
            ...cycleFilter,
          },
        }),

        db.performanceReview.count({
          where: { tenantId, ...cycleFilter },
        }),

        db.performanceReview.count({
          where: {
            tenantId,
            status: 'ACKNOWLEDGED',
            ...cycleFilter,
          },
        }),

        db.goal.aggregate({
          where: { tenantId, ...cycleFilter },
          _avg: { progress: true },
        }),
      ])

      return NextResponse.json({
        success: true,
        data: {
          totalGoals,
          completedGoals,
          goalCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
          avgGoalProgress: Math.round(avgGoalProgress._avg.progress || 0),
          totalReviews,
          completedReviews,
          reviewCompletionRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
          currentCycle: currentCycle ? {
            id: currentCycle.id,
            name: currentCycle.name,
          } : null,
        },
      })
    }
  } catch (error) {
    console.error('Error fetching performance stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
