import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'
import { z } from 'zod'

const toggleSchema = z.object({
  isActive: z.boolean(),
})

// POST /api/analytics/alerts/[id]/toggle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json()
    const data = toggleSchema.parse(body)

    const alert = await alertService.toggleAlertActive(
      tenantId,
      params.id,
      data.isActive
    )

    return NextResponse.json({
      success: true,
      data: alert,
      message: `Alert ${data.isActive ? 'activated' : 'deactivated'} successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    console.error('Error toggling alert:', error)
    return NextResponse.json(
      { error: 'Failed to toggle alert' },
      { status: 500 }
    )
  }
}
