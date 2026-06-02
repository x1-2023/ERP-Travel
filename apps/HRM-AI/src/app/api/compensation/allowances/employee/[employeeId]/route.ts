import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as allowanceService from '@/services/compensation/allowance.service'

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await allowanceService.getEmployeeAllowances(session.user.tenantId, params.employeeId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
