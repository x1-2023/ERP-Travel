import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as allowanceService from '@/services/compensation/allowance.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await allowanceService.assignAllowance(session.user.tenantId, {
      ...body, effectiveFrom: new Date(body.effectiveFrom),
      effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
