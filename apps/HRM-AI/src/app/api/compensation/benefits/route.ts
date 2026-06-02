import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as benefitService from '@/services/compensation/benefit.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const type = request.nextUrl.searchParams.get('type') || undefined
    const result = await benefitService.getBenefitPlans(session.user.tenantId, type)
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
    const result = await benefitService.createBenefitPlan(session.user.tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
