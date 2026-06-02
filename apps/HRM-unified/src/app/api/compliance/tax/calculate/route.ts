// src/app/api/compliance/tax/calculate/route.ts
// API endpoint for calculating personal income tax (TNCN)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  TaxCalculator,
  grossToNet,
  netToGross,
  formatTaxAmount,
  formatTaxRate,
  getTaxBracketInfo,
} from '@/lib/compliance/tax'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// REQUEST SCHEMAS
// ═══════════════════════════════════════════════════════════════

const calculateSchema = z.object({
  type: z.enum(['monthly', 'gross_to_net', 'net_to_gross']).default('monthly'),
  grossIncome: z.number().nonnegative().optional(),
  netIncome: z.number().nonnegative().optional(),
  insuranceSalary: z.number().nonnegative().optional(),
  dependentCount: z.number().int().nonnegative().default(0),
  otherDeductions: z.number().nonnegative().default(0),
})

// ═══════════════════════════════════════════════════════════════
// POST - Calculate tax
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = calculateSchema.parse(body)

    let result

    switch (validated.type) {
      case 'monthly': {
        if (!validated.grossIncome) {
          return NextResponse.json(
            { error: 'grossIncome is required for monthly calculation' },
            { status: 400 }
          )
        }

        const calculator = new TaxCalculator({
          grossIncome: validated.grossIncome,
          insuranceSalary: validated.insuranceSalary,
          dependentCount: validated.dependentCount,
          otherDeductions: validated.otherDeductions,
        })

        const calculation = calculator.calculate()
        const bracketInfo = getTaxBracketInfo(calculation.taxableIncome)

        result = {
          calculation,
          bracketInfo,
          formatted: {
            grossIncome: formatTaxAmount(calculation.grossIncome),
            insuranceDeduction: formatTaxAmount(calculation.insuranceDeduction),
            personalDeduction: formatTaxAmount(calculation.personalDeduction),
            dependentDeduction: formatTaxAmount(calculation.dependentDeduction),
            taxableIncome: formatTaxAmount(calculation.taxableIncome),
            taxAmount: formatTaxAmount(calculation.taxAmount),
            netIncome: formatTaxAmount(calculation.netIncome),
            effectiveRate: formatTaxRate(calculation.effectiveRate),
            bracketRate: formatTaxRate(bracketInfo.rate),
          },
        }
        break
      }

      case 'gross_to_net': {
        if (!validated.grossIncome) {
          return NextResponse.json(
            { error: 'grossIncome is required for gross_to_net calculation' },
            { status: 400 }
          )
        }

        const netIncome = grossToNet(validated.grossIncome, {
          insuranceSalary: validated.insuranceSalary,
          dependentCount: validated.dependentCount,
        })

        result = {
          grossIncome: validated.grossIncome,
          netIncome,
          formatted: {
            grossIncome: formatTaxAmount(validated.grossIncome),
            netIncome: formatTaxAmount(netIncome),
          },
        }
        break
      }

      case 'net_to_gross': {
        if (!validated.netIncome) {
          return NextResponse.json(
            { error: 'netIncome is required for net_to_gross calculation' },
            { status: 400 }
          )
        }

        const grossIncome = netToGross(validated.netIncome, {
          insuranceSalary: validated.insuranceSalary,
          dependentCount: validated.dependentCount,
        })

        result = {
          netIncome: validated.netIncome,
          grossIncome,
          formatted: {
            netIncome: formatTaxAmount(validated.netIncome),
            grossIncome: formatTaxAmount(grossIncome),
          },
        }
        break
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Tax calculation error:', error)
    return NextResponse.json(
      { error: 'Không thể tính thuế' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// GET - Get tax brackets info
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return tax bracket information
    const { TAX_BRACKETS, TAX_DEDUCTIONS } = await import('@/lib/compliance/tax/constants')

    return NextResponse.json({
      success: true,
      data: {
        brackets: TAX_BRACKETS,
        deductions: TAX_DEDUCTIONS,
        description: 'Vietnam Personal Income Tax (TNCN) - Biểu thuế lũy tiến từng phần',
      },
    })
  } catch (error) {
    console.error('Get tax brackets error:', error)
    return NextResponse.json(
      { error: 'Không thể tải thông tin thuế' },
      { status: 500 }
    )
  }
}
