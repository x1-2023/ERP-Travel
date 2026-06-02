import { NextRequest } from 'next/server'
import { authenticateApiRequest, apiResponse, apiError } from '@/lib/api/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request, 'write:attendance')
  if (!auth.success) return apiError(auth.error!, auth.statusCode)

  const body = await request.json()
  const { employeeCode } = body

  if (!employeeCode) return apiError('employeeCode required')

  const employee = await db.employee.findFirst({
    where: { tenantId: auth.tenantId, employeeCode },
  })

  if (!employee) return apiError('Employee not found', 404)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const existing = await db.attendance.findUnique({
    where: {
      tenantId_employeeId_date: { tenantId: auth.tenantId!, employeeId: employee.id, date: today },
    },
  })

  if (!existing) return apiError('No clock-in record found for today', 400)

  const record = await db.attendance.update({
    where: { id: existing.id },
    data: { checkOut: now },
  })

  return apiResponse(record)
}
