// src/app/api/payroll/components/route.ts
// Salary Components API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { salaryComponentService } from '@/services/salary-component.service'
import { z } from 'zod'
import { safeParseInt } from '@/lib/api/parse-params'

const componentSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  code: z.string().min(1, 'Mã không được để trống').max(50),
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
  itemType: z.enum(['EARNING', 'DEDUCTION', 'EMPLOYER_COST']),
  defaultAmount: z.number().optional(),
  isPercentage: z.boolean().optional(),
  percentageBase: z.string().optional(),
  isTaxable: z.boolean().optional(),
  isInsuranceable: z.boolean().optional(),
  sortOrder: z.number().optional(),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') as never || undefined,
      itemType: searchParams.get('itemType') as never || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true :
                searchParams.get('isActive') === 'false' ? false : undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 50),
    }

    const result = await salaryComponentService.findAll(
      session.user.tenantId,
      filters
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching salary components:', error)
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

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = componentSchema.parse(body)

    const component = await salaryComponentService.create(
      session.user.tenantId,
      {
        ...validatedData,
        isActive: true,
      }
    )

    return NextResponse.json(component, { status: 201 })
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
    console.error('Error creating salary component:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
