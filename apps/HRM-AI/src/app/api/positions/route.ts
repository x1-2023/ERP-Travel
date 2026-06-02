import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { positionService } from "@/services/position.service"
import { audit } from "@/lib/audit/logger"
import { createPositionSchema } from "@/lib/validations/position"
import { withErrorHandler, Errors, successResponse } from "@/lib/errors"

export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const positions = await positionService.findAll(session.user.tenantId)
  return successResponse(positions)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    throw Errors.unauthorized()
  }

  const body = await request.json()
  const validated = createPositionSchema.parse(body)

  const position = await positionService.create(session.user.tenantId, validated)

  await audit.create(
    { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' },
    'Position',
    position.id
  )

  return successResponse(position, undefined, 201)
})

