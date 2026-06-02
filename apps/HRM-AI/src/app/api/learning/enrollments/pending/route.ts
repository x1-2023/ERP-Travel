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
      approverId: userId,
      page: safeParseInt(searchParams.get('page'), 1),
      limit: safeParseInt(searchParams.get('limit'), 20),
    }

    const result = await enrollmentService.getPendingEnrollments(tenantId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching pending enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
