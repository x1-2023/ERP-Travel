import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPipelineData } from '@/services/recruitment/application.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = session.user.tenantId
    const requisitionId = searchParams.get('requisitionId') || undefined

    const result = await getPipelineData(tenantId, requisitionId)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/applications/pipeline error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
