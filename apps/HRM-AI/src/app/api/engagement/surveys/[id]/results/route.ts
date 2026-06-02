import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSurveyResults } from '@/services/engagement/engagement.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const results = await getSurveyResults(session.user.tenantId, id)
    return NextResponse.json({ success: true, data: results })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get results'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
