// GET /api/internal/org/stats
// Return aggregate org stats: totalEmployees, activeEmployees, departments, newHires30d, turnover30d

import { NextRequest, NextResponse } from 'next/server'
import { validateInternalRequest } from '@/lib/api/internal-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = validateInternalRequest(req)
  if (authError) return authError

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalEmployees,
      activeEmployees,
      departmentCount,
      newHires30d,
      turnover30d,
    ] = await Promise.all([
      // Total employees (not soft-deleted)
      db.employee.count({
        where: { deletedAt: null },
      }),

      // Active employees
      db.employee.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),

      // Active departments
      db.department.count({
        where: { isActive: true },
      }),

      // New hires in last 30 days
      db.employee.count({
        where: {
          deletedAt: null,
          hireDate: { gte: thirtyDaysAgo },
        },
      }),

      // Turnover in last 30 days (resigned or terminated)
      db.employee.count({
        where: {
          resignationDate: { gte: thirtyDaysAgo },
          status: { in: ['RESIGNED', 'TERMINATED'] },
        },
      }),
    ])

    return NextResponse.json({
      data: {
        totalEmployees,
        activeEmployees,
        departments: departmentCount,
        newHires30d,
        turnover30d,
      },
    })
  } catch (error) {
    console.error('[Internal API] Org stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
