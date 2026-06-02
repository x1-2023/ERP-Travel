import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { Unauthorized, NotFound, handleApiError } from '@/lib/api/errors'
import { apiSuccess, apiNoContent } from '@/lib/api/response'
import { validateRequest, updateWebhookSchema } from '@/lib/validations'

// GET /api/webhooks/[id] — Webhook detail with recent logs
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const webhook = await prisma.webhook.findUnique({
      where: { id: params.id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!webhook) return handleApiError(NotFound('Webhook'), '/api/webhooks/[id]')

    // Don't expose the secret
    const { secret: _, ...rest } = webhook
    return apiSuccess(rest)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/webhooks/[id]')
    return handleApiError(error, '/api/webhooks/[id]')
  }
}

// PATCH /api/webhooks/[id] — Update webhook
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.webhook.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Webhook'), '/api/webhooks/[id]')

    const body = await req.json()
    const data = validateRequest(updateWebhookSchema, body)

    const updated = await prisma.webhook.update({
      where: { id: params.id },
      data,
    })

    const { secret: _, ...rest } = updated
    return apiSuccess(rest)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/webhooks/[id]')
    return handleApiError(error, '/api/webhooks/[id]')
  }
}

// DELETE /api/webhooks/[id] — Delete webhook (cascade logs)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.webhook.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Webhook'), '/api/webhooks/[id]')

    await prisma.webhook.delete({ where: { id: params.id } })

    return apiNoContent()
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/webhooks/[id]')
    return handleApiError(error, '/api/webhooks/[id]')
  }
}
