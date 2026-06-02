// src/app/api/shifts/route.ts
// Shift management API

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { shiftService } from '@/services/shift.service'
import { z } from 'zod'
import { withErrorHandler, Errors, successResponse, paginatedResponse } from '@/lib/errors'
import { checkPermission } from '@/lib/security/rbac'
import { safeParseInt } from '@/lib/api/parse-params'

const createShiftSchema = z.object({
  name: z.string().min(1, 'Tên ca là bắt buộc'),
  code: z.string().min(1, 'Mã ca là bắt buộc'),
  shiftType: z.enum(['STANDARD', 'MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE', 'ROTATING']).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ bắt đầu không hợp lệ'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ kết thúc không hợp lệ'),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakMinutes: z.number().min(0).optional(),
  workHoursPerDay: z.number().min(0).max(24).optional(),
  lateGrace: z.number().min(0).optional(),
  earlyGrace: z.number().min(0).optional(),
  otStartAfter: z.number().min(0).optional(),
  nightShiftStart: z.string().optional().nullable(),
  nightShiftEnd: z.string().optional().nullable(),
  isOvernight: z.boolean().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const { searchParams } = new URL(request.url)
  const filters = {
    search: searchParams.get('search') || undefined,
    shiftType: (searchParams.get('shiftType') as "STANDARD" | "MORNING" | "AFTERNOON" | "NIGHT" | "FLEXIBLE" | "ROTATING") || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    page: safeParseInt(searchParams.get('page'), 1),
    pageSize: safeParseInt(searchParams.get('pageSize'), 20),
  }

  const result = await shiftService.findAll(session.user.tenantId, filters)

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

  // Check permission using RBAC
  checkPermission(session.user.role, 'attendance', 'create')

  const body = await request.json()
  const validatedData = createShiftSchema.parse(body)

  // Check duplicate code
  const existing = await shiftService.findByCode(session.user.tenantId, validatedData.code)
  if (existing) {
    throw Errors.duplicate('Mã ca')
  }

  const shift = await shiftService.create(session.user.tenantId, validatedData)

  return successResponse(shift, undefined, 201)
})

