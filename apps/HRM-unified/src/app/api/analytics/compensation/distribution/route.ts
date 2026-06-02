// src/app/api/analytics/compensation/distribution/route.ts
// Salary Distribution API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { compensationService } from '@/services/analytics/compensation.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await compensationService.getSalaryDistribution(
      session.user.tenantId
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching salary distribution:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
