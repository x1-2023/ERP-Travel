import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'
import { z } from 'zod'

const updateAlertSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  metricType: z.string().optional(),
  condition: z.enum(['gt', 'lt', 'eq', 'gte', 'lte', 'change_percent']).optional(),
  threshold: z.number().optional(),
  compareWith: z.enum(['previous_period', 'same_period_last_year', 'fixed_value']).optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  departmentId: z.string().optional(),
  notifyUsers: z.array(z.string()).optional(),
  notifyRoles: z.array(z.string()).optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
  cooldownMinutes: z.number().int().positive().optional(),
})

// GET /api/analytics/alerts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const alert = await alertService.getAlertById(tenantId, params.id)

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: alert,
    })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

// PATCH /api/analytics/alerts/[id]
export async function PATCH(
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
    const data = updateAlertSchema.parse(body)

    const alert = await alertService.updateAlert(tenantId, params.id, data)

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert updated successfully',
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
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

// DELETE /api/analytics/alerts/[id]
export async function DELETE(
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
    await alertService.deleteAlert(tenantId, params.id)

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
