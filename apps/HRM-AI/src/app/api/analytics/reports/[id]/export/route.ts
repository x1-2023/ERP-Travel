import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reportBuilderService } from '@/services/analytics'
import { z } from 'zod'

const exportReportSchema = z.object({
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']),
  parameters: z.record(z.string(), z.unknown()).optional(),
})

// POST /api/analytics/reports/[id]/export
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const userId = session.user.id
    const body = await request.json()
    const data = exportReportSchema.parse(body)

    const exportRecord = await reportBuilderService.exportReport(
      tenantId,
      params.id,
      userId,
      data.format,
      data.parameters
    )

    return NextResponse.json({
      success: true,
      data: exportRecord,
      message: 'Export started',
    }, { status: 202 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}

// GET /api/analytics/reports/[id]/export - Get export history for a report
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
    const userId = session.user.id

    const exports = await reportBuilderService.getExports(tenantId, userId, params.id)

    return NextResponse.json({
      success: true,
      data: exports,
    })
  } catch (error) {
    console.error('Error fetching exports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exports' },
      { status: 500 }
    )
  }
}
