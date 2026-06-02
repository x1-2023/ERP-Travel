// src/lib/validations/holiday.ts
// Holiday validation schemas

import { z } from 'zod'

export const holidaySchema = z.object({
  name: z.string().min(1, 'Tên ngày lễ là bắt buộc').max(100),
  date: z.coerce.date({ message: 'Ngày là bắt buộc' }),
  endDate: z.coerce.date().optional().nullable(),
  dayType: z.enum(['NORMAL', 'WEEKEND', 'HOLIDAY', 'COMPENSATORY']).default('HOLIDAY'),
  compensatoryDate: z.coerce.date().optional().nullable(),
  isRecurring: z.boolean().default(false),
  isNational: z.boolean().default(true),
  notes: z.string().max(500).optional().nullable(),
}).refine(
  (data) => {
    if (data.endDate) {
      return data.endDate >= data.date
    }
    return true
  },
  { message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', path: ['endDate'] }
)

export const createHolidaySchema = holidaySchema

export const updateHolidaySchema = holidaySchema.partial().extend({
  id: z.string(),
})

export type HolidayFormData = z.infer<typeof holidaySchema>
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>
