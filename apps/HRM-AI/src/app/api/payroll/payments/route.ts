// src/app/api/payroll/payments/route.ts
// Bank Payment Batches API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { bankPaymentService } from '@/services/bank-payment.service'
import { z } from 'zod'
import { safeParseInt } from '@/lib/api/parse-params'

const generateFileSchema = z.object({
  periodId: z.string().min(1, 'Vui lòng chọn kỳ lương'),
  bankCode: z.enum(['VCB', 'TCB', 'BIDV', 'GENERIC']),
  companyName: z.string().min(1, 'Vui lòng nhập tên công ty'),
  companyAccount: z.string().min(1, 'Vui lòng nhập số tài khoản công ty'),
  companyBankCode: z.string().min(1, 'Vui lòng nhập mã ngân hàng'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      periodId: searchParams.get('periodId') || undefined,
      bankCode: searchParams.get('bankCode') as never || undefined,
      status: searchParams.get('status') as never || undefined,
      page: safeParseInt(searchParams.get('page'), 1),
      pageSize: safeParseInt(searchParams.get('pageSize'), 20),
    }

    const result = await bankPaymentService.findAll(
      session.user.tenantId,
      filters
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching bank payment batches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Generate bank file
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
    const validatedData = generateFileSchema.parse(body)

    const file = await bankPaymentService.generatePaymentFile(
      session.user.tenantId,
      validatedData.periodId,
      validatedData.bankCode,
      {
        companyName: validatedData.companyName,
        companyAccount: validatedData.companyAccount,
        companyBankCode: validatedData.companyBankCode,
      }
    )

    // Return file content as response
    return new NextResponse(file.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
        'X-Total-Records': file.totalRecords.toString(),
        'X-Total-Amount': file.totalAmount.toString(),
        'X-File-Format': file.format,
      },
    })
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
    console.error('Error generating bank payment file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
