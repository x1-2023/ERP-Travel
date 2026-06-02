// src/app/api/compliance/tax/summary/route.ts
// Tax summary - aggregate payrolls + tax settlements for a year

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

    // Count employees with payroll in this year
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
        pit: true,
        taxableIncome: true,
        assessableIncome: true,
        grossSalary: true,
      }
    })

    // Aggregate by employee
    const employeeMap = new Map<string, { totalPit: number; totalTaxable: number; totalGross: number }>()
    for (const p of payrolls) {
      const existing = employeeMap.get(p.employeeId) || { totalPit: 0, totalTaxable: 0, totalGross: 0 }
      existing.totalPit += Number(p.pit)
      existing.totalTaxable += Number(p.taxableIncome)
      existing.totalGross += Number(p.grossSalary)
      employeeMap.set(p.employeeId, existing)
    }

    const totalEmployees = employeeMap.size
    let totalTaxAmount = 0
    let totalTaxPaid = 0

    for (const emp of employeeMap.values()) {
      totalTaxPaid += emp.totalPit
    }

    // Check TaxSettlement records for the year
    const settlements = await db.taxSettlement.findMany({
      where: { tenantId, settlementYear: year },
      select: { taxAmount: true, taxPaid: true, taxOwed: true, taxRefund: true }
    })

    if (settlements.length > 0) {
      totalTaxAmount = settlements.reduce((sum, s) => sum + Number(s.taxAmount), 0)
      totalTaxPaid = settlements.reduce((sum, s) => sum + Number(s.taxPaid), 0)
    } else {
      // Estimate from payroll data - PIT paid equals amount
      totalTaxAmount = totalTaxPaid
    }

    const totalDifference = totalTaxAmount - totalTaxPaid

    // Compute bracket distribution from assessable income
    const bracketThresholds = [
      { bracket: 1, min: 0, max: 5_000_000, rate: 0.05 },
      { bracket: 2, min: 5_000_000, max: 10_000_000, rate: 0.1 },
      { bracket: 3, min: 10_000_000, max: 18_000_000, rate: 0.15 },
      { bracket: 4, min: 18_000_000, max: 32_000_000, rate: 0.2 },
      { bracket: 5, min: 32_000_000, max: 52_000_000, rate: 0.25 },
      { bracket: 6, min: 52_000_000, max: 80_000_000, rate: 0.3 },
      { bracket: 7, min: 80_000_000, max: Infinity, rate: 0.35 },
    ]

    // Determine highest bracket per employee based on average monthly assessable
    const brackets = bracketThresholds.map(b => ({ ...b, count: 0 }))
    const monthCount = Math.min(new Date().getMonth() + 1, 12)

    for (const emp of employeeMap.values()) {
      const avgMonthlyAssessable = emp.totalTaxable / monthCount
      let highestBracket = 0
      for (const b of bracketThresholds) {
        if (avgMonthlyAssessable > b.min) {
          highestBracket = b.bracket
        }
      }
      if (highestBracket > 0) {
        brackets[highestBracket - 1].count++
      }
    }

    const avgTaxRate = totalTaxPaid > 0 && totalEmployees > 0
      ? totalTaxAmount / (Array.from(employeeMap.values()).reduce((s, e) => s + e.totalGross, 0) || 1)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        totalTaxAmount,
        totalTaxPaid,
        totalDifference,
        avgTaxRate: Math.round(avgTaxRate * 1000) / 1000,
        brackets: brackets.map(b => ({
          bracket: b.bracket,
          count: b.count,
          rate: b.rate,
        })),
      }
    })
  } catch (error) {
    console.error('Error fetching tax summary:', error)
    return NextResponse.json({ error: 'Failed to fetch tax summary' }, { status: 500 })
  }
}
