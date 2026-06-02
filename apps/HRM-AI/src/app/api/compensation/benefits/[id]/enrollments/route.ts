import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as benefitService from '@/services/compensation/benefit.service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await benefitService.enrollInBenefit(session.user.tenantId, body.employeeId, {
      planId: params.id, effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined, notes: body.notes,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
