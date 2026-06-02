// src/app/api/payroll/components/[id]/route.ts
// Single Salary Component API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { salaryComponentService } from '@/services/salary-component.service'
import { z } from 'zod'

const updateComponentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(50).optional(),
  category: z.enum([
    'BASE_SALARY',
    'ALLOWANCE_TAXABLE',
    'ALLOWANCE_NON_TAXABLE',
    'OVERTIME',
    'BONUS',
    'COMMISSION',
    'INSURANCE_EMPLOYEE',
    'INSURANCE_EMPLOYER',
    'PIT',
    'ADVANCE',
    'LOAN',
    'OTHER_DEDUCTION',
    'OTHER_EARNING',
  ]).optional(),
  itemType: z.enum(['EARNING', 'DEDUCTION', 'EMPLOYER_COST']).optional(),
  defaultAmount: z.number().optional(),
  isPercentage: z.boolean().optional(),
  percentageBase: z.string().optional(),
  isTaxable: z.boolean().optional(),
  isInsuranceable: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const component = await salaryComponentService.findById(
      session.user.tenantId,
      id
    )

    if (!component) {
      return NextResponse.json(
        { error: 'Thành phần lương không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json(component)
  } catch (error) {
    console.error('Error fetching salary component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateComponentSchema.parse(body)

    const component = await salaryComponentService.update(
      session.user.tenantId,
      id,
      validatedData
    )

    return NextResponse.json(component)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error updating salary component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await salaryComponentService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error deleting salary component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
