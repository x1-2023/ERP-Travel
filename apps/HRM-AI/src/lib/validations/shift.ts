// src/lib/validations/shift.ts
// Shift validation schemas

import { z } from 'zod'

export const shiftSchema = z.object({
  name: z.string().min(1, 'Tên ca là bắt buộc').max(100),
  code: z.string().min(1, 'Mã ca là bắt buộc').max(20),
  shiftType: z.enum(['STANDARD', 'MORNING', 'AFTERNOON', 'NIGHT', 'FLEXIBLE', 'ROTATING']).default('STANDARD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ không hợp lệ (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ không hợp lệ (HH:mm)'),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  breakMinutes: z.number().min(0).max(120).default(60),
  workHoursPerDay: z.number().min(0).max(24).default(8),
  lateGrace: z.number().min(0).max(60).default(15),
  earlyGrace: z.number().min(0).max(60).default(15),
  otStartAfter: z.number().min(0).max(120).default(30),
  nightShiftStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  nightShiftEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  isOvernight: z.boolean().default(false),
  color: z.string().default('#3B82F6'),
  isActive: z.boolean().default(true),
})

export const createShiftSchema = shiftSchema

export const updateShiftSchema = shiftSchema.partial().extend({
  id: z.string(),
})

export type ShiftFormData = z.infer<typeof shiftSchema>
export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>

// Shift assignment validation
export const shiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  shiftId: z.string().min(1, 'Ca làm việc là bắt buộc'),
  startDate: z.coerce.date({ message: 'Ngày bắt đầu là bắt buộc' }),
  endDate: z.coerce.date().optional().nullable(),
  daysOfWeek: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
  isRecurring: z.boolean().default(false),
  isPrimary: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
})

export const bulkAssignmentSchema = z.object({
  employeeIds: z.array(z.string()).min(1, 'Chọn ít nhất một nhân viên'),
  shiftId: z.string().min(1, 'Ca làm việc là bắt buộc'),
  startDate: z.coerce.date({ message: 'Ngày bắt đầu là bắt buộc' }),
  endDate: z.coerce.date().optional().nullable(),
})

export type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentSchema>
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>
