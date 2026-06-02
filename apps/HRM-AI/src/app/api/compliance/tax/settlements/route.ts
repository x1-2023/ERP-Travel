// src/app/api/compliance/tax/settlements/route.ts
// Tax settlements list

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
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Try TaxSettlement records first
    const taxSettlements = await db.taxSettlement.findMany({
      where: { tenantId, settlementYear: year },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (taxSettlements.length > 0) {
      const settlements = taxSettlements.map(s => ({
        id: s.id,
        employeeCode: s.employee.employeeCode,
        fullName: s.employee.fullName,
        totalIncome: Number(s.totalGrossIncome),
        taxableIncome: Number(s.taxableIncome),
        taxAmount: Number(s.taxAmount),
        taxPaid: Number(s.taxPaid),
        difference: Number(s.taxOwed) - Number(s.taxRefund),
        status: s.status,
      }))

      return NextResponse.json({ success: true, data: { settlements } })
    }

    // Fallback: aggregate from payroll data
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999)

    const payrolls = await db.payroll.findMany({
      where: {
        tenantId,
        period: {
          is: {
            periodStart: { gte: yearStart },
            periodEnd: { lte: yearEnd },
          }
        },
        status: { in: ['APPROVED', 'PAID'] },
      },
      select: {
        employeeId: true,
        employeeCode: true,
        employeeName: true,
        grossSalary: true,
        taxableIncome: true,
        pit: true,
      }
    })

    // Aggregate by employee
    const empMap = new Map<string, {
      employeeCode: string
      fullName: string
      totalIncome: number
      taxableIncome: number
      taxPaid: number
    }>()

    for (const p of payrolls) {
      const existing = empMap.get(p.employeeId) || {
        employeeCode: p.employeeCode,
        fullName: p.employeeName,
        totalIncome: 0,
        taxableIncome: 0,
        taxPaid: 0,
      }
      existing.totalIncome += Number(p.grossSalary)
      existing.taxableIncome += Number(p.taxableIncome)
      existing.taxPaid += Number(p.pit)
      empMap.set(p.employeeId, existing)
    }

    const settlements = Array.from(empMap.entries()).map(([id, emp]) => ({
      id,
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      totalIncome: emp.totalIncome,
      taxableIncome: emp.taxableIncome,
      taxAmount: emp.taxPaid, // Same as paid when no settlement
      taxPaid: emp.taxPaid,
      difference: 0,
      status: 'PENDING',
    }))

    return NextResponse.json({ success: true, data: { settlements } })
  } catch (error) {
    console.error('Error fetching tax settlements:', error)
    return NextResponse.json({ error: 'Failed to fetch tax settlements' }, { status: 500 })
  }
}
