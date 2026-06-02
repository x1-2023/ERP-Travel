import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as enrollmentService from '@/services/learning/enrollment.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const params = {
      tenantId,
      employeeId: userId,
      status: searchParams.get('status') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      limit: safeParseInt(searchParams.get('limit'), 20),
    }

    const result = await enrollmentService.getMyEnrollments(tenantId, userId, { status: params.status })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await enrollmentService.enrollInCourse(tenantId, userId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
