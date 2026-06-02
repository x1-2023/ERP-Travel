import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listApplications } from '@/services/marketplace/marketplace.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await listApplications(session.user.tenantId, {
      applicantId: searchParams.get('applicantId') || undefined,
      status: searchParams.get('status') as never,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing applications:', error)
    return NextResponse.json({ error: 'Failed to list applications' }, { status: 500 })
  }
}
