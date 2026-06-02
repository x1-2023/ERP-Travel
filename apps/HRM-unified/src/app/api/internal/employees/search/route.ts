// GET /api/internal/employees/search?q=xxx&department=sales
// Search employees by name or email, optionally filter by department

import { NextRequest, NextResponse } from 'next/server'
import { validateInternalRequest } from '@/lib/api/internal-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = validateInternalRequest(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const department = searchParams.get('department') || ''
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 50)

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    // Search by name or email
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { workEmail: { contains: q, mode: 'insensitive' } },
        { personalEmail: { contains: q, mode: 'insensitive' } },
        { employeeCode: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Filter by department name
    if (department) {
      where.department = {
        name: { contains: department, mode: 'insensitive' },
      }
    }

    const employees = await db.employee.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        workEmail: true,
        phone: true,
        avatar: true,
        status: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        position: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      orderBy: { fullName: 'asc' },
    })

    const result = employees.map((emp) => ({
      id: emp.id,
      name: emp.fullName,
      email: emp.workEmail,
      phone: emp.phone,
      department: emp.department?.name || null,
      position: emp.position?.name || null,
      avatarUrl: emp.avatar,
      isActive: emp.status === 'ACTIVE',
    }))

    return NextResponse.json({ data: result, total: result.length })
  } catch (error) {
    console.error('[Internal API] Employee search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
