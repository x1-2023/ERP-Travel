import { NextRequest } from 'next/server'
import { authenticateApiRequest, apiResponse, apiError } from '@/lib/api/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticateApiRequest(request, 'read:employees')
  if (!auth.success) return apiError(auth.error!, auth.statusCode)

  const employee = await db.employee.findFirst({
    where: { id: params.id, tenantId: auth.tenantId },
    include: {
      department: { select: { id: true, name: true } },
      position: { select: { id: true, name: true } },
    },
  })

  if (!employee) return apiError('Employee not found', 404)
  return apiResponse(employee)
}
