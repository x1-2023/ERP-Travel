// src/app/api/compliance/tax/dependents/route.ts
// Dependents list with relationship type counts

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

    // Get all active dependents via employees in this tenant
    const dependents = await db.dependent.findMany({
      where: {
        isActive: true,
        employee: { tenantId, deletedAt: null }
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            fullName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Count by relationship type
    const byType = {
      children: 0,
      parents: 0,
      spouse: 0,
      other: 0,
    }

    const dependentList = dependents.map(d => {
      switch (d.relationship) {
        case 'CHILD': byType.children++; break
        case 'PARENT': byType.parents++; break
        case 'SPOUSE': byType.spouse++; break
        default: byType.other++; break
      }

      const relationshipLabels: Record<string, string> = {
        CHILD: 'Con',
        PARENT: 'Cha/Mẹ',
        SPOUSE: 'Vợ/Chồng',
        OTHER: 'Khác',
      }

      return {
        id: d.id,
        employeeCode: d.employee.employeeCode,
        employeeName: d.employee.fullName,
        dependentName: d.fullName,
        relationship: relationshipLabels[d.relationship] || d.relationship,
        birthDate: d.dateOfBirth?.toISOString() || null,
        taxCode: d.idNumber || '',
        validFrom: d.taxDeductionFrom?.toISOString() || d.createdAt.toISOString(),
        status: d.isActive ? 'ACTIVE' : 'INACTIVE',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        total: dependents.length,
        byType,
        dependents: dependentList,
      }
    })
  } catch (error) {
    console.error('Error fetching dependents:', error)
    return NextResponse.json({ error: 'Failed to fetch dependents' }, { status: 500 })
  }
}
