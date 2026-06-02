import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateSurveyStatus } from '@/services/engagement/engagement.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()
    const survey = await updateSurveyStatus(session.user.tenantId, id, status)
    return NextResponse.json({ success: true, data: survey })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
