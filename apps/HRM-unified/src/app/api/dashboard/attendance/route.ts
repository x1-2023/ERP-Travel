// src/app/api/dashboard/attendance/route.ts
// Dashboard Attendance API - Real-time attendance metrics

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    const targetDate = dateStr ? new Date(dateStr) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const dayOfWeek = targetDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Total active employees expected to work
    const totalActiveEmployees = await db.employee.count({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      }
    })

    // Get attendance records for the day
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const attendanceRecords = await db.attendance.findMany({
      where: {
        tenantId,
        date: {
          gte: targetDate,
          lte: endOfDay
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: { select: { id: true, name: true, code: true } },
            position: { select: { name: true } }
          }
        }
      }
    })

    // Count by status
    const statusCounts = {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
      workFromHome: 0,
      businessTrip: 0
    }

    const lateEmployees: Array<{
      id: string
      employeeCode: string
      fullName: string
      department: string
      checkIn: Date | null
      lateMinutes: number
    }> = []

    const absentEmployees: Array<{
      id: string
      employeeCode: string
      fullName: string
      department: string
    }> = []

    for (const record of attendanceRecords) {
      switch (record.status) {
        case 'PRESENT':
          statusCounts.present++
          break
        case 'LATE':
        case 'LATE_AND_EARLY':
          statusCounts.late++
          if (record.employee) {
            lateEmployees.push({
              id: record.employee.id,
              employeeCode: record.employee.employeeCode,
              fullName: record.employee.fullName,
              department: record.employee.department?.name || 'N/A',
              checkIn: record.checkIn,
              lateMinutes: record.lateMinutes || 0
            })
          }
          break
        case 'ABSENT':
          statusCounts.absent++
          if (record.employee) {
            absentEmployees.push({
              id: record.employee.id,
              employeeCode: record.employee.employeeCode,
              fullName: record.employee.fullName,
              department: record.employee.department?.name || 'N/A'
            })
          }
          break
        case 'ON_LEAVE':
          statusCounts.onLeave++
          break
        case 'WORK_FROM_HOME':
          statusCounts.workFromHome++
          break
        case 'BUSINESS_TRIP':
          statusCounts.businessTrip++
          break
      }
    }

    // Calculate employees not checked in yet (if current day)
    const now = new Date()
    const isToday = targetDate.toDateString() === now.toDateString()
    const recordedEmployeeIds = new Set(attendanceRecords.map(r => r.employeeId))

    let notCheckedIn = 0
    if (isToday && !isWeekend) {
      const allActiveEmployees = await db.employee.findMany({
        where: {
          tenantId,
          status: { in: ['ACTIVE', 'PROBATION'] },
          deletedAt: null
        },
        select: { id: true }
      })

      notCheckedIn = allActiveEmployees.filter(e => !recordedEmployeeIds.has(e.id)).length
    }

    // Calculate attendance rate
    const totalRecorded = attendanceRecords.length
    const totalWorking = statusCounts.present + statusCounts.late + statusCounts.workFromHome + statusCounts.businessTrip
    const attendanceRate = totalActiveEmployees > 0
      ? Math.round((totalWorking / totalActiveEmployees) * 100 * 10) / 10
      : 0

    // Get attendance by hour (check-in distribution)
    const checkInsByHour: Record<number, number> = {}
    for (const record of attendanceRecords) {
      if (record.checkIn) {
        const hour = new Date(record.checkIn).getHours()
        checkInsByHour[hour] = (checkInsByHour[hour] || 0) + 1
      }
    }

    // Top 5 late employees (sorted by late minutes)
    const topLate = lateEmployees
      .sort((a, b) => b.lateMinutes - a.lateMinutes)
      .slice(0, 5)

    // Get weekly trend (last 7 days)
    const weeklyTrend: Array<{
      date: string
      present: number
      late: number
      absent: number
      total: number
    }> = []

    for (let i = 6; i >= 0; i--) {
      const trendDate = new Date(targetDate)
      trendDate.setDate(trendDate.getDate() - i)

      const dayStart = new Date(trendDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(trendDate)
      dayEnd.setHours(23, 59, 59, 999)

      const dow = trendDate.getDay()
      if (dow === 0 || dow === 6) {
        weeklyTrend.push({
          date: trendDate.toISOString().split('T')[0],
          present: 0,
          late: 0,
          absent: 0,
          total: 0
        })
        continue
      }

      const dayRecords = await db.attendance.groupBy({
        by: ['status'],
        where: {
          tenantId,
          date: { gte: dayStart, lte: dayEnd }
        },
        _count: true
      })

      const dayPresent = dayRecords.find(r => r.status === 'PRESENT')?._count || 0
      const dayLate = (dayRecords.find(r => r.status === 'LATE')?._count || 0) +
                      (dayRecords.find(r => r.status === 'LATE_AND_EARLY')?._count || 0)
      const dayAbsent = dayRecords.find(r => r.status === 'ABSENT')?._count || 0

      weeklyTrend.push({
        date: trendDate.toISOString().split('T')[0],
        present: dayPresent,
        late: dayLate,
        absent: dayAbsent,
        total: dayPresent + dayLate
      })
    }

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      isWeekend,
      isToday,
      summary: {
        totalEmployees: totalActiveEmployees,
        totalRecorded,
        attendanceRate,
        notCheckedIn
      },
      status: statusCounts,
      lateEmployees: topLate,
      absentEmployees: absentEmployees.slice(0, 10),
      checkInDistribution: checkInsByHour,
      weeklyTrend,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching attendance dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}
