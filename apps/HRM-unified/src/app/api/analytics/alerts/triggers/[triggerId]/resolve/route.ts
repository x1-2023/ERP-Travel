import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { alertService } from '@/services/analytics'
import { z } from 'zod'

const resolveSchema = z.object({
  resolution: z.string().min(1, 'Resolution is required'),
})

// POST /api/analytics/alerts/triggers/[triggerId]/resolve
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
    const body = await request.json()
    const data = resolveSchema.parse(body)

    const trigger = await alertService.resolveAlert(
      tenantId,
      params.triggerId,
      userId,
      data.resolution
    )

    return NextResponse.json({
      success: true,
      data: trigger,
      message: 'Alert resolved successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Alert trigger not found' }, { status: 404 })
    }
    console.error('Error resolving alert:', error)
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}
