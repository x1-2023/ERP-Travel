// src/app/api/payroll/adjustments/route.ts
// Payroll Adjustments API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollAdjustmentService } from '@/services/payroll-adjustment.service'
import { z } from 'zod'
import { safeParseInt, safeParseIntOptional } from '@/lib/api/parse-params'

const createAdjustmentSchema = z.object({
  employeeId: z.string().min(1, 'Vui lòng chọn nhân viên'),
  year: z.number().min(2020).max(2100),
  month: z.number().min(1).max(12),
  name: z.string().min(1, 'Tên điều chỉnh không được để trống'),
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
  ]),
  itemType: z.enum(['EARNING', 'DEDUCTION']),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  isTaxable: z.boolean().optional(),
  reason: z.string().min(1, 'Vui lòng nhập lý do điều chỉnh'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      employeeId: searchParams.get('employeeId') || undefined,
      year: safeParseIntOptional(searchParams.get('year')),
      month: safeParseIntOptional(searchParams.get('month')),
      status: searchParams.get('status') as never || undefined,
      category: searchParams.get('category') as never || undefined,
      itemType: searchParams.get('itemType') as never || undefined,
      search: searchParams.get('search') || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await payrollAdjustmentService.findAll(
      session.user.tenantId,
      filters
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payroll adjustments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createAdjustmentSchema.parse(body)

    const adjustment = await payrollAdjustmentService.create(
      session.user.tenantId,
      session.user.id,
      {
        ...validatedData,
        attachmentUrl: validatedData.attachmentUrl || undefined,
      }
    )

    return NextResponse.json(adjustment, { status: 201 })
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
    console.error('Error creating payroll adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
