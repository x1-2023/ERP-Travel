import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as certificationService from '@/services/learning/certification.service'
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
      daysAhead: safeParseInt(searchParams.get('daysAhead'), 30),
    }

    const result = await certificationService.getExpiringCertifications(tenantId, params.daysAhead)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching expiring certifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
