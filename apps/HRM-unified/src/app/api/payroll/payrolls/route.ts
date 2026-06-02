// src/app/api/payroll/payrolls/route.ts
// Payrolls API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { payrollService } from '@/services/payroll.service'
import { withErrorHandler, Errors, paginatedResponse } from '@/lib/errors'
import { safeParseInt } from '@/lib/api/parse-params'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const filters = {
    periodId: searchParams.get('periodId') || undefined,
    employeeId: searchParams.get('employeeId') || undefined,
    departmentId: searchParams.get('departmentId') || undefined,
    status: searchParams.get('status') as never || undefined,
    isPaid: searchParams.get('isPaid') === 'true' ? true :
      searchParams.get('isPaid') === 'false' ? false : undefined,
    search: searchParams.get('search') || undefined,
    page: safeParseInt(searchParams.get('page'), 1),
    pageSize: safeParseInt(searchParams.get('pageSize'), 50),
  }

  const result = await payrollService.findAll(session.user.tenantId, filters)

  return paginatedResponse(result.data, {
    page: filters.page,
    pageSize: filters.pageSize,
    total: result.pagination.total,
  })
})

