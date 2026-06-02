// GET /api/internal/employees/[id]
// Return single employee detail

import { NextRequest, NextResponse } from 'next/server'
import { validateInternalRequest } from '@/lib/api/internal-auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = validateInternalRequest(req)
  if (authError) return authError

  try {
    const { id } = params

    const employee = await db.employee.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        workEmail: true,
        personalEmail: true,
        phone: true,
        avatar: true,
        status: true,
        hireDate: true,
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
        directManager: {
          select: {
            id: true,
            fullName: true,
            workEmail: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const result = {
      id: employee.id,
      name: employee.fullName,
      email: employee.workEmail,
      department: employee.department?.name || null,
      position: employee.position?.name || null,
      manager: employee.directManager
        ? {
            id: employee.directManager.id,
            name: employee.directManager.fullName,
            email: employee.directManager.workEmail,
          }
        : null,
      joinDate: employee.hireDate,
      isActive: employee.status === 'ACTIVE',
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[Internal API] Employee detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
