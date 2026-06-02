// src/app/api/attendance/route.ts
// Attendance management API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { z } from 'zod'
import { withErrorHandler, Errors, successResponse, paginatedResponse } from '@/lib/errors'
import { safeParseInt } from '@/lib/api/parse-params'

const createAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  date: z.coerce.date(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  status: z.enum([
    'PRESENT',
    'ABSENT',
    'LATE',
    'EARLY_LEAVE',
    'LATE_AND_EARLY',
    'ON_LEAVE',
    'BUSINESS_TRIP',
    'WORK_FROM_HOME',
    'HOLIDAY',
  ]),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
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
    shiftId: searchParams.get('shiftId') || undefined,
    status: (searchParams.get('status') as "PRESENT" | "ABSENT" | "LATE" | "EARLY_LEAVE" | "LATE_AND_EARLY" | "ON_LEAVE" | "BUSINESS_TRIP" | "WORK_FROM_HOME" | "HOLIDAY") || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    page: safeParseInt(searchParams.get('page'), 1),
    pageSize: safeParseInt(searchParams.get('pageSize'), 20),
  }

  const result = await attendanceService.findAll(session.user.tenantId, filters)

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

  // RBAC check
  if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'HR_STAFF'].includes(session.user.role)) {
    throw Errors.forbidden('Bạn không có quyền tạo chấm công')
  }

  const body = await request.json()
  const validatedData = createAttendanceSchema.parse(body)

  const attendance = await attendanceService.createManualEntry(
    session.user.tenantId,
    validatedData,
    session.user.id
  )

  return successResponse(attendance, undefined, 201)
})

