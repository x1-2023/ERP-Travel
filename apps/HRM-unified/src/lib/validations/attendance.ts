// src/lib/validations/attendance.ts
// Attendance validation schemas

import { z } from 'zod'

export const manualAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  date: z.coerce.date({ message: 'Ngày là bắt buộc' }),
  checkIn: z.coerce.date().optional().nullable(),
  checkOut: z.coerce.date().optional().nullable(),
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
  ], { message: 'Trạng thái là bắt buộc' }),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).optional(),
  notes: z.string().max(500).optional().nullable(),
}).refine(
  (data) => {
    if (data.checkIn && data.checkOut) {
      return data.checkOut > data.checkIn
    }
    return true
  },
  { message: 'Giờ ra phải sau giờ vào', path: ['checkOut'] }
)

export const adjustAttendanceSchema = z.object({
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
  ]).optional(),
  notes: z.string().max(500).optional(),
})

export const clockInSchema = z.object({
  source: z.enum(['MANUAL', 'WEB_CLOCK', 'MOBILE_APP', 'FINGERPRINT', 'FACE_ID', 'CARD', 'IMPORT']).default('WEB_CLOCK'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional(),
  note: z.string().max(200).optional(),
})

export const clockOutSchema = clockInSchema

export type ManualAttendanceFormData = z.infer<typeof manualAttendanceSchema>
export type AdjustAttendanceInput = z.infer<typeof adjustAttendanceSchema>
export type ClockInInput = z.infer<typeof clockInSchema>
export type ClockOutInput = z.infer<typeof clockOutSchema>

// Overtime validation
export const overtimeRequestSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  date: z.coerce.date({ message: 'Ngày tăng ca là bắt buộc' }),
  startTime: z.coerce.date({ message: 'Giờ bắt đầu là bắt buộc' }),
  endTime: z.coerce.date({ message: 'Giờ kết thúc là bắt buộc' }),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).default('NORMAL'),
  reason: z.string().min(1, 'Lý do là bắt buộc').max(500),
  attachmentUrl: z.string().url().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: 'Giờ kết thúc phải sau giờ bắt đầu', path: ['endTime'] }
)

export const approveOvertimeSchema = z.object({
  actualHours: z.number().min(0).max(24).optional(),
})

export const rejectOvertimeSchema = z.object({
  reason: z.string().min(1, 'Lý do từ chối là bắt buộc').max(500),
})

export type OvertimeRequestFormData = z.infer<typeof overtimeRequestSchema>
export type ApproveOvertimeInput = z.infer<typeof approveOvertimeSchema>
export type RejectOvertimeInput = z.infer<typeof rejectOvertimeSchema>
