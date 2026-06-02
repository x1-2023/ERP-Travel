// src/app/api/analytics/workforce/trends/route.ts
// Workforce trends API - monthly headcount, hires, terminations, turnover

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const now = new Date()
    const currentYear = now.getFullYear()

    // Try AnalyticsSnapshot first for pre-computed monthly data
    const snapshots = await db.analyticsSnapshot.findMany({
      where: {
        tenantId,
        snapshotType: 'MONTHLY',
        snapshotDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        }
      },
      orderBy: { snapshotDate: 'asc' }
    })

    if (snapshots.length >= 3) {
      // Use snapshot data
      const data = snapshots.map(s => ({
        month: `T${new Date(s.snapshotDate).getMonth() + 1}`,
        headcount: s.totalHeadcount,
        hires: s.newHires,
        terminations: s.terminations,
        turnoverRate: Number(s.turnoverRate),
        benchmark: 12,
      }))

      return NextResponse.json({ success: true, data })
    }

    // Fallback: compute on-the-fly from Employee records
    const data = []
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1)
      const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59, 999)

      // Skip future months
      if (monthStart > now) break

      // Headcount at end of month (or current date if current month)
      const countDate = monthEnd > now ? now : monthEnd

      const headcount = await db.employee.count({
        where: {
          tenantId,
          status: { in: ['ACTIVE', 'PROBATION'] },
          hireDate: { lte: countDate },
          deletedAt: null,
          OR: [
            { resignationDate: null },
            { resignationDate: { gt: countDate } }
          ]
        }
      })

      // New hires in this month
      const hires = await db.employee.count({
        where: {
          tenantId,
          hireDate: { gte: monthStart, lte: monthEnd },
          deletedAt: null
        }
      })

      // Terminations in this month
      const terminations = await db.employee.count({
        where: {
          tenantId,
          status: { in: ['RESIGNED', 'TERMINATED'] },
          resignationDate: { gte: monthStart, lte: monthEnd },
          deletedAt: null
        }
      })

      const turnoverRate = headcount > 0
        ? Math.round((terminations / headcount) * 100 * 10) / 10
        : 0

      data.push({
        month: `T${month + 1}`,
        headcount,
        hires,
        terminations,
        turnoverRate,
        benchmark: 12,
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching workforce trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workforce trends' },
      { status: 500 }
    )
  }
}
