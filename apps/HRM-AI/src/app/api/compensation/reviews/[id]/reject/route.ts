import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as reviewService from '@/services/compensation/review.service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await reviewService.rejectReview(params.id, session.user.tenantId, session.user.id, body.comments)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
