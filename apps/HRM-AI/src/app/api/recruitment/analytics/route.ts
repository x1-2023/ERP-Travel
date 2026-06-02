import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getHiringAnalytics } from '@/services/recruitment/analytics.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    const result = await getHiringAnalytics(tenantId)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/analytics error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
