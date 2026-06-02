import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Get the start and end of the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Get training sessions for the month
    const sessions = await db.trainingSession.findMany({
      where: {
        tenantId,
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    // Format calendar events
    const events = sessions.map((s) => ({
      id: s.id,
      type: 'session' as const,
      title: s.title || s.course?.title || 'Training Session',
      date: s.startDate,
      endDate: s.endDate,
      location: s.location,
      isVirtual: s.isVirtual,
      virtualLink: s.virtualLink,
      course: s.course,
      instructorName: s.instructorName,
      attendeeCount: s._count.enrollments,
      maxParticipants: s.maxParticipants,
      status: s.status,
    }))

    return NextResponse.json({
      month,
      year,
      events,
    })
  } catch (error) {
    console.error('Error fetching learning calendar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
