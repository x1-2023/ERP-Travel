import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/recruitment/stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    const [
      openJobs,
      totalCandidates,
      interviewsThisWeek,
      pendingOffers,
      hiredThisMonth,
      totalApplications,
      applicationsByStatus,
      sourceBreakdown,
      recentHires,
    ] = await Promise.all([
      // Open requisitions
      db.jobRequisition.count({ where: { tenantId, status: 'OPEN' } }),

      // Total candidates
      db.candidate.count({ where: { tenantId } }),

      // Interviews this week
      db.interview.count({
        where: {
          tenantId,
          scheduledAt: { gte: startOfWeek },
          result: 'PENDING',
        },
      }),

      // Pending offers
      db.offer.count({
        where: { tenantId, status: { in: ['SENT', 'APPROVED'] } },
      }),

      // Hired this month
      db.application.count({
        where: {
          tenantId,
          status: 'HIRED',
          updatedAt: { gte: startOfMonth },
        },
      }),

      // Total applications
      db.application.count({ where: { tenantId } }),

      // Applications by status
      db.application.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),

      // Source breakdown
      db.application.groupBy({
        by: ['source'],
        where: { tenantId },
        _count: { id: true },
      }),

      // Recent hires
      db.application.findMany({
        where: { tenantId, status: 'HIRED' },
        include: {
          candidate: { select: { fullName: true, email: true } },
          requisition: { select: { title: true, department: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ])

    // Calculate average time to hire
    const hiredApplications = await db.application.findMany({
      where: { tenantId, status: 'HIRED' },
      select: { createdAt: true, updatedAt: true },
      take: 100,
      orderBy: { updatedAt: 'desc' },
    })

    const avgTimeToHire = hiredApplications.length > 0
      ? Math.round(
          hiredApplications.reduce((sum: number, app) => {
            const days = Math.ceil(
              (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )
            return sum + days
          }, 0) / hiredApplications.length
        )
      : 0

    // Conversion rate
    const totalHired = await db.application.count({ where: { tenantId, status: 'HIRED' } })
    const conversionRate = totalApplications > 0
      ? Math.round((totalHired / totalApplications) * 100)
      : 0

    // Pipeline funnel using actual ApplicationStatus values
    const pipelineFunnel = [
      { stage: 'Mới', count: applicationsByStatus.find((s) => s.status === 'NEW')?._count.id || 0 },
      { stage: 'Sàng lọc', count: applicationsByStatus.find((s) => s.status === 'SCREENING')?._count.id || 0 },
      { stage: 'Phỏng vấn ĐT', count: applicationsByStatus.find((s) => s.status === 'PHONE_SCREEN')?._count.id || 0 },
      { stage: 'Phỏng vấn', count: applicationsByStatus.find((s) => s.status === 'INTERVIEW')?._count.id || 0 },
      { stage: 'Đánh giá', count: applicationsByStatus.find((s) => s.status === 'ASSESSMENT')?._count.id || 0 },
      { stage: 'Offer', count: applicationsByStatus.find((s) => s.status === 'OFFER')?._count.id || 0 },
      { stage: 'Đã tuyển', count: applicationsByStatus.find((s) => s.status === 'HIRED')?._count.id || 0 },
    ]

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          openJobs,
          totalCandidates,
          interviewsThisWeek,
          pendingOffers,
          hiredThisMonth,
          avgTimeToHire,
          conversionRate,
        },
        pipelineFunnel,
        sourceBreakdown: sourceBreakdown.map((s) => ({
          source: s.source,
          count: s._count.id,
        })),
        recentHires: recentHires.map((h) => ({
          candidateName: h.candidate.fullName,
          position: h.requisition.title,
          department: h.requisition.department?.name,
          hiredAt: h.updatedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching recruitment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
