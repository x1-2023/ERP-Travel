import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as allowanceService from '@/services/compensation/allowance.service'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await allowanceService.updateAllowanceType(params.id, session.user.tenantId, body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
