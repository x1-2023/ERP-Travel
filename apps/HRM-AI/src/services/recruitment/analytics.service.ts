import { db } from '@/lib/db'
import type { HiringAnalytics } from '@/types/recruitment'

export async function getHiringAnalytics(tenantId: string): Promise<HiringAnalytics> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

  const [
    openRequisitions,
    totalApplications,
    newApplicationsThisWeek,
    interviewsThisWeek,
    offersExtended,
    offersAccepted,
    sourceData,
    stageData,
    hiredApplications,
  ] = await Promise.all([
    db.jobRequisition.count({
      where: { tenantId, status: { in: ['OPEN', 'APPROVED'] } },
    }),
    db.application.count({ where: { tenantId } }),
    db.application.count({
      where: { tenantId, createdAt: { gte: weekAgo } },
    }),
    db.interview.count({
      where: { tenantId, scheduledAt: { gte: weekAgo, lte: now } },
    }),
    db.offer.count({
      where: { tenantId, status: { in: ['SENT', 'ACCEPTED', 'DECLINED'] } },
    }),
    db.offer.count({
      where: { tenantId, status: 'ACCEPTED' },
    }),
    db.application.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: true,
    }),
    db.application.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    }),
    db.application.findMany({
      where: { tenantId, status: 'HIRED', hiredAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, hiredAt: true },
    }),
  ])

  // Calculate average time to hire
  let averageTimeToHire = 0
  if (hiredApplications.length > 0) {
    const totalDays = hiredApplications.reduce((sum, app) => {
      if (app.hiredAt) {
        return sum + (app.hiredAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      }
      return sum
    }, 0)
    averageTimeToHire = Math.round(totalDays / hiredApplications.length)
  }

  // Calculate hiring trend by month
  const hiringTrend: { month: string; hired: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })

    const hired = hiredApplications.filter(a =>
      a.hiredAt && a.hiredAt >= monthStart && a.hiredAt <= monthEnd
    ).length

    hiringTrend.push({ month: monthName, hired })
  }

  return {
    openRequisitions,
    totalApplications,
    newApplicationsThisWeek,
    interviewsThisWeek,
    offersExtended,
    offersAccepted,
    averageTimeToHire,
    sourceBreakdown: sourceData.map(s => ({ source: s.source, count: s._count })),
    stageBreakdown: stageData.map(s => ({ stage: s.status, count: s._count })),
    hiringTrend,
  }
}
