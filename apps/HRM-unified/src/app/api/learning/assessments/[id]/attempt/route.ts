import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as assessmentService from '@/services/learning/assessment.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { id } = await params
    const body = await request.json()
    const result = await assessmentService.submitAttempt(id, body.responses || [])
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting assessment attempt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
