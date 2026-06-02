// src/app/api/holidays/route.ts
// Holiday management API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { holidayService } from '@/services/holiday.service'
import { z } from 'zod'
import { withErrorHandler, Errors, successResponse, paginatedResponse } from '@/lib/errors'
import { checkPermission } from '@/lib/security/rbac'
import { safeParseInt, safeParseIntOptional } from '@/lib/api/parse-params'

const createHolidaySchema = z.object({
  name: z.string().min(1, 'Tên ngày lễ là bắt buộc'),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
  compensatoryDate: z.coerce.date().optional().nullable(),
  isRecurring: z.boolean().optional(),
  isNational: z.boolean().optional(),
  notes: z.string().optional(),
})

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const filters = {
    year: safeParseIntOptional(searchParams.get('year')),
    isNational: searchParams.get('isNational') === 'true' ? true : searchParams.get('isNational') === 'false' ? false : undefined,
    page: safeParseInt(searchParams.get('page'), 1),
    pageSize: safeParseInt(searchParams.get('pageSize'), 50),
  }

  const result = await holidayService.findAll(session.user.tenantId, filters)

  return paginatedResponse(result.data, {
    page: filters.page,
    pageSize: filters.pageSize,
    total: result.pagination.total,
  })
})

export const POST = withErrorHandler(async (request: NextRequest): Promise<any> => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  // Check permission using RBAC
  checkPermission(session.user.role, 'attendance', 'create')

  const body = await request.json()

  // Check if seeding national holidays
  if (body.action === 'seed') {
    const year = body.year || new Date().getFullYear()
    const result = await holidayService.seedNationalHolidays(session.user.tenantId, year)
    return successResponse(result, undefined, 201)
  }

  const validatedData = createHolidaySchema.parse(body)
  const holiday = await holidayService.create(session.user.tenantId, validatedData)

  return successResponse(holiday, undefined, 201)
})

