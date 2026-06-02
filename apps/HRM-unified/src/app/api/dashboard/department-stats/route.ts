// src/app/api/dashboard/department-stats/route.ts
// Dashboard Department Stats API - Workforce by department

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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all departments with employee counts
    const departments = await db.department.findMany({
      where: {
        tenantId,
        isActive: true
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, fullName: true, employeeCode: true } },
        _count: {
          select: {
            employees: {
              where: {
                status: { in: ['ACTIVE', 'PROBATION'] },
                deletedAt: null
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Get employee counts by department with status breakdown
    const employeesByDept = await db.employee.groupBy({
      by: ['departmentId', 'status'],
      where: {
        tenantId,
        deletedAt: null
      },
      _count: true
    })

    // Get gender distribution by department
    const genderByDept = await db.employee.groupBy({
      by: ['departmentId', 'gender'],
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null
      },
      _count: true
    })

    // Get new hires this month by department
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const newHiresByDept = await db.employee.groupBy({
      by: ['departmentId'],
      where: {
        tenantId,
        hireDate: { gte: firstDayOfMonth },
        deletedAt: null
      },
      _count: true
    })

    // Get resignations this month by department
    const resignationsByDept = await db.employee.groupBy({
      by: ['departmentId'],
      where: {
        tenantId,
        status: 'RESIGNED',
        resignationDate: { gte: firstDayOfMonth },
        deletedAt: null
      },
      _count: true
    })

    // Get today's attendance by department
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const attendanceByDept = await db.attendance.findMany({
      where: {
        tenantId,
        date: { gte: today, lte: endOfDay }
      },
      select: {
        status: true,
        employee: {
          select: { departmentId: true }
        }
      }
    })

    // Process department data
    const departmentStats = departments.map(dept => {
      const deptEmployees = employeesByDept.filter(e => e.departmentId === dept.id)
      const deptGender = genderByDept.filter(g => g.departmentId === dept.id)
      const deptNewHires = newHiresByDept.find(n => n.departmentId === dept.id)?._count || 0
      const deptResignations = resignationsByDept.find(r => r.departmentId === dept.id)?._count || 0

      const activeCount = deptEmployees.find(e => e.status === 'ACTIVE')?._count || 0
      const probationCount = deptEmployees.find(e => e.status === 'PROBATION')?._count || 0
      const resignedCount = deptEmployees.find(e => e.status === 'RESIGNED')?._count || 0

      const maleCount = deptGender.find(g => g.gender === 'MALE')?._count || 0
      const femaleCount = deptGender.find(g => g.gender === 'FEMALE')?._count || 0

      // Today's attendance for this department
      const deptAttendance = attendanceByDept.filter(a => a.employee?.departmentId === dept.id)
      const presentCount = deptAttendance.filter(a => a.status === 'PRESENT').length
      const lateCount = deptAttendance.filter(a => ['LATE', 'LATE_AND_EARLY'].includes(a.status)).length
      const absentCount = deptAttendance.filter(a => a.status === 'ABSENT').length
      const onLeaveCount = deptAttendance.filter(a => a.status === 'ON_LEAVE').length

      const headcount = activeCount + probationCount
      const attendanceRate = headcount > 0
        ? Math.round(((presentCount + lateCount) / headcount) * 100)
        : 0

      return {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        parentId: dept.parentId,
        parent: dept.parent,
        manager: dept.manager,
        headcount,
        status: {
          active: activeCount,
          probation: probationCount,
          resigned: resignedCount
        },
        gender: {
          male: maleCount,
          female: femaleCount
        },
        movement: {
          newHires: deptNewHires,
          resignations: deptResignations,
          netChange: deptNewHires - deptResignations
        },
        attendance: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          onLeave: onLeaveCount,
          rate: attendanceRate
        }
      }
    })

    // Calculate totals
    const totals = departmentStats.reduce((acc, dept) => ({
      headcount: acc.headcount + dept.headcount,
      newHires: acc.newHires + dept.movement.newHires,
      resignations: acc.resignations + dept.movement.resignations,
      present: acc.present + dept.attendance.present,
      late: acc.late + dept.attendance.late,
      absent: acc.absent + dept.attendance.absent
    }), { headcount: 0, newHires: 0, resignations: 0, present: 0, late: 0, absent: 0 })

    // Build hierarchy for tree view
    const rootDepartments = departmentStats.filter(d => !d.parentId)
    const buildTree = (parentId: string | null): typeof departmentStats => {
      return departmentStats
        .filter(d => d.parentId === parentId)
        .map(d => ({
          ...d,
          children: buildTree(d.id)
        }))
    }

    const hierarchy = buildTree(null)

    // Top departments by headcount
    const topDepartments = [...departmentStats]
      .sort((a, b) => b.headcount - a.headcount)
      .slice(0, 10)

    // Departments with attendance issues (low attendance rate)
    const attendanceIssues = departmentStats
      .filter(d => d.headcount > 0 && d.attendance.rate < 80)
      .sort((a, b) => a.attendance.rate - b.attendance.rate)
      .slice(0, 5)

    return NextResponse.json({
      departments: departmentStats,
      hierarchy,
      topDepartments,
      attendanceIssues,
      totals: {
        ...totals,
        netChange: totals.newHires - totals.resignations,
        attendanceRate: totals.headcount > 0
          ? Math.round(((totals.present + totals.late) / totals.headcount) * 100)
          : 0
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching department stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department stats' },
      { status: 500 }
    )
  }
}
