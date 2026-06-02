import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'

// POST /api/analytics/alerts/triggers/[triggerId]/acknowledge
export async function POST(
  request: NextRequest,
  { params }: { params: { triggerId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const userId = session.user.id

    const trigger = await alertService.acknowledgeAlert(
      tenantId,
      params.triggerId,
      userId
    )

    return NextResponse.json({
      success: true,
      data: trigger,
      message: 'Alert acknowledged successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Alert trigger not found' }, { status: 404 })
    }
    console.error('Error acknowledging alert:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}
