// src/app/api/compliance/insurance/calculate/route.ts
// API endpoint for calculating insurance contributions

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { InsuranceCalculator, calculateBatchInsurance, type WageRegion } from '@/lib/compliance/insurance'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// REQUEST SCHEMA
// ═══════════════════════════════════════════════════════════════

const singleCalculationSchema = z.object({
  baseSalary: z.number().positive('Mức lương phải lớn hơn 0'),
  region: z.number().min(1).max(4).optional().default(1),
  year: z.number().optional(),
})

const batchCalculationSchema = z.object({
  employees: z.array(
    z.object({
      employeeId: z.string(),
      baseSalary: z.number().positive(),
      region: z.number().min(1).max(4).optional(),
    })
  ),
  year: z.number().optional(),
})

// ═══════════════════════════════════════════════════════════════
// POST - Calculate insurance
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if it's a batch calculation
    if (body.employees && Array.isArray(body.employees)) {
      const validated = batchCalculationSchema.parse(body)

      const result = calculateBatchInsurance(
        validated.employees.map((emp) => ({
          employeeId: emp.employeeId,
          baseSalary: emp.baseSalary,
          region: emp.region as WageRegion,
        })),
        validated.year
      )

      return NextResponse.json({
        success: true,
        data: result,
      })
    }

    // Single calculation
    const validated = singleCalculationSchema.parse(body)

    const calculator = new InsuranceCalculator({
      baseSalary: validated.baseSalary,
      region: validated.region as WageRegion,
      year: validated.year,
    })

    const contribution = calculator.calculate()

    return NextResponse.json({
      success: true,
      data: {
        contribution,
        formatted: {
          baseSalary: new Intl.NumberFormat('vi-VN').format(contribution.baseSalary) + ' VND',
          employeeTotal: new Intl.NumberFormat('vi-VN').format(contribution.employee.total) + ' VND',
          employerTotal: new Intl.NumberFormat('vi-VN').format(contribution.employer.total) + ' VND',
          grandTotal: new Intl.NumberFormat('vi-VN').format(contribution.total) + ' VND',
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Insurance calculation error:', error)
    return NextResponse.json(
      { error: 'Không thể tính toán bảo hiểm' },
      { status: 500 }
    )
  }
}
