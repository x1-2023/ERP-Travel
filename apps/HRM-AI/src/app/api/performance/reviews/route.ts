import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as reviewService from '@/services/performance/review.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = request.nextUrl
    const params = {
      userId,
      cycleId: searchParams.get('cycleId') || undefined,
      status: searchParams.get('status') || undefined,
      employeeId: searchParams.get('employeeId') || undefined,
      reviewerId: searchParams.get('reviewerId') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await reviewService.getPerformanceReviews(tenantId, params as any)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error listing reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
