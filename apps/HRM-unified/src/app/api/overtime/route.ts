// src/app/api/overtime/route.ts
// Overtime request management API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { overtimeService } from '@/services/overtime.service'
import { z } from 'zod'
import { withErrorHandler, Errors, successResponse, paginatedResponse } from '@/lib/errors'
import { isAtLeastRole, Role } from '@/lib/security/rbac'
import { safeParseInt } from '@/lib/api/parse-params'

const createOvertimeSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
})

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const filters = {
    search: searchParams.get('search') || undefined,
    employeeId: searchParams.get('employeeId') || undefined,
    departmentId: searchParams.get('departmentId') || undefined,
    status: (searchParams.get('status') as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED") || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    page: safeParseInt(searchParams.get('page'), 1),
    pageSize: safeParseInt(searchParams.get('pageSize'), 20),
  }

  // If not HR/Admin, only show own requests (row-level security)
  if (!isAtLeastRole(session.user.role, Role.HR_STAFF)) {
    if (session.user.employeeId) {
      filters.employeeId = session.user.employeeId
    }
  }

  const result = await overtimeService.findAll(session.user.tenantId, filters)

  return paginatedResponse(result.data, {
    page: filters.page,
    pageSize: filters.pageSize,
    total: result.pagination.total,
  })
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const body = await request.json()
  const validatedData = createOvertimeSchema.parse(body)

  // Regular employees can only create OT for themselves
  if (!isAtLeastRole(session.user.role, Role.HR_STAFF)) {
    if (validatedData.employeeId !== session.user.employeeId) {
      throw Errors.forbidden('Bạn chỉ có thể tạo yêu cầu tăng ca cho chính mình')
    }
  }

  const overtime = await overtimeService.create(session.user.tenantId, validatedData)

  return successResponse(overtime, undefined, 201)
})

