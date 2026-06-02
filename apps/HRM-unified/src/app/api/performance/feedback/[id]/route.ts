import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as feedbackService from '@/services/performance/feedback.service'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const result = await feedbackService.declineFeedbackRequest(params.id, userId)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error declining feedback request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
