import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'

// POST /api/analytics/alerts/check - Run alert checks manually
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin/HR roles
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenantId = session.user.tenantId
    const results = await alertService.checkAlerts(tenantId)

    const triggered = results.filter(r => r.triggered)

    return NextResponse.json({
      success: true,
      data: {
        checkedCount: results.length,
        triggeredCount: triggered.length,
        results,
      },
      message: `Checked ${results.length} alerts, ${triggered.length} triggered`,
    })
  } catch (error) {
    console.error('Error checking alerts:', error)
    return NextResponse.json(
      { error: 'Failed to check alerts' },
      { status: 500 }
    )
  }
}
