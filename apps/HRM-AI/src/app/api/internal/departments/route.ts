// GET /api/internal/departments
// Return all departments with head count and manager info

import { NextRequest, NextResponse } from 'next/server'
import { validateInternalRequest } from '@/lib/api/internal-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = validateInternalRequest(req)
  if (authError) return authError

  try {
    const departments = await db.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            workEmail: true,
          },
        },
        _count: {
          select: {
            employees: {
              where: {
                deletedAt: null,
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const result = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      headCount: dept._count.employees,
      manager: dept.manager
        ? {
            id: dept.manager.id,
            name: dept.manager.fullName,
            email: dept.manager.workEmail,
          }
        : null,
    }))

    return NextResponse.json({ data: result, total: result.length })
  } catch (error) {
    console.error('[Internal API] Departments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
