import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import * as feedbackService from '@/services/performance/feedback.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || 'pending'

    const result = await feedbackService.getFeedbackRequests(tenantId, { providerId: userId, status: status as any })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching feedback requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await feedbackService.requestFeedback(tenantId, userId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error requesting feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
