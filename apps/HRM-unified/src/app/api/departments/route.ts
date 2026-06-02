import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { departmentService } from "@/services/department.service"
import { audit } from "@/lib/audit/logger"
import { createDepartmentSchema } from "@/lib/validations/department"
import { withErrorHandler, Errors, successResponse } from "@/lib/errors"

export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const departments = await departmentService.findAll(session.user.tenantId)
  return successResponse(departments)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const body = await request.json()
  const validated = createDepartmentSchema.parse(body)

  const department = await departmentService.create(session.user.tenantId, validated)

  await audit.create(
    { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' },
    'Department',
    department.id
  )

  return successResponse(department, undefined, 201)
})

