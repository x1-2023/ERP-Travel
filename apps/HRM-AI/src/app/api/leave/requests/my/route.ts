// src/app/api/leave/requests/my/route.ts
// Get my leave requests

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { leaveRequestService } from '@/services/leave-request.service'
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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { employeeId: true },
    })

    if (!user?.employeeId) {
      return NextResponse.json({ error: 'No employee profile' }, { status: 400 })
    }

    const requests = await leaveRequestService.getByEmployee(
      session.user.tenantId,
      user.employeeId,
      year
    )

    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
