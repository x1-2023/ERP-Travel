import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/learning/stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'personal' // 'personal' or 'org'
    const employeeId = session.user.employeeId
    const tenantId = session.user.tenantId

    if (scope === 'personal') {
      const [
        enrolledCourses,
        completedCourses,
        inProgressCourses,
        certificatesEarned,
        enrollments,
      ] = await Promise.all([
        // Enrolled courses (total)
        db.enrollment.count({
          where: { employeeId },
        }),

        // Completed courses
        db.enrollment.count({
          where: {
            employeeId,
            status: 'COMPLETED',
          },
        }),

        // In progress courses
        db.enrollment.count({
          where: {
            employeeId,
            status: 'IN_PROGRESS',
          },
        }),

        // Certificates earned
        db.employeeCertification.count({
          where: {
            employeeId,
          },
        }),

        // All enrollments for progress calculation
        db.enrollment.findMany({
          where: { employeeId },
          include: {
            course: { select: { title: true, durationHours: true, thumbnailUrl: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }),
      ])

      // Calculate total hours learned
      const totalHours = enrollments
        .filter((e) => e.status === 'COMPLETED')
        .reduce((sum, e) => sum + Number(e.course.durationHours || 0), 0)
      const totalHoursLearned = Math.round(totalHours)

      // Calculate average progress
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0

      // Get recent courses (top 5)
      const recentCourses = enrollments.slice(0, 5).map((e) => ({
        courseId: e.courseId,
        title: e.course.title,
        thumbnail: e.course.thumbnailUrl,
        progress: e.progress,
        status: e.status,
        lastAccessedAt: e.updatedAt,
      }))

      return NextResponse.json({
        success: true,
        data: {
          enrolledCourses,
          completedCourses,
          inProgressCourses,
          totalHoursLearned,
          certificatesEarned,
          avgProgress,
          recentCourses,
        },
      })
    } else {
      // Organization-level stats
      const [
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        activeLearners,
        coursesByCategory,
        topCourses,
      ] = await Promise.all([
        db.course.count({ where: { tenantId } }),
        db.course.count({ where: { tenantId, status: 'PUBLISHED' } }),
        db.enrollment.count({ where: { tenantId } }),
        db.enrollment.count({ where: { tenantId, status: 'COMPLETED' } }),
        db.enrollment.groupBy({
          by: ['employeeId'],
          where: {
            tenantId,
            updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }).then((r) => r.length),
        db.course.groupBy({
          by: ['categoryId'],
          where: { tenantId },
          _count: { id: true },
        }),
        db.course.findMany({
          where: { tenantId, status: 'PUBLISHED' },
          include: {
            _count: { select: { enrollments: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }).then(courses => courses.map(c => ({
          id: c.id,
          title: c.title,
          enrollmentCount: c._count.enrollments,
        }))),
      ])

      const completionRate = totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0

      return NextResponse.json({
        success: true,
        data: {
          totalCourses,
          publishedCourses,
          totalEnrollments,
          completedEnrollments,
          completionRate,
          activeLearners,
          coursesByCategory,
          topCourses,
        },
      })
    }
  } catch (error) {
    console.error('Error fetching learning stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
