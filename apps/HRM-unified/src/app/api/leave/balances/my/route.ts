// src/app/api/leave/balances/my/route.ts
// Get my leave balances

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { leaveBalanceService } from '@/services/leave-balance.service'
import { db } from '@/lib/db'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
      ? safeParseInt(searchParams.get('year'), 0)
      : new Date().getFullYear()

    // Get employee ID from user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { employeeId: true },
    })

    if (!user?.employeeId) {
      return NextResponse.json({ error: 'No employee profile' }, { status: 400 })
    }

    // Initialize balances if needed
    await leaveBalanceService.initializeForEmployee(
      session.user.tenantId,
      user.employeeId,
      year
    )

    const balances = await leaveBalanceService.getByEmployee(
      session.user.tenantId,
      user.employeeId,
      year
    )

    return NextResponse.json({ data: balances })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}
