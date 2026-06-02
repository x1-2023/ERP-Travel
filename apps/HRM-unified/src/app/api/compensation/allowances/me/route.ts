import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as allowanceService from '@/services/compensation/allowance.service'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await db.user.findFirst({ where: { id: session.user.id }, select: { employeeId: true } })
    if (!user?.employeeId) return NextResponse.json({ error: 'No employee linked' }, { status: 400 })
    const result = await allowanceService.getEmployeeAllowances(session.user.tenantId, user.employeeId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
