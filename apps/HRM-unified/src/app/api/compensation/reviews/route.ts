import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as reviewService from '@/services/compensation/review.service'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = request.nextUrl
    const result = await reviewService.getCompensationReviews(session.user.tenantId, {
      cycleId: searchParams.get('cycleId') || undefined,
      status: searchParams.get('status') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
    }, safeParseInt(searchParams.get('page'), 1), safeParseInt(searchParams.get('limit'), 20))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await reviewService.createCompensationReview(session.user.tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
