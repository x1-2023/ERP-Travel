import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as analyticsService from '@/services/compensation/analytics.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await analyticsService.getCompensationAnalytics(session.user.tenantId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
