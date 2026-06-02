import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as reviewService from '@/services/compensation/review.service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await reviewService.submitReview(params.id, session.user.tenantId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
