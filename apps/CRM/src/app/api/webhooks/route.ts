import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess, apiCreated } from '@/lib/api/response'
import { validateRequest, createWebhookSchema } from '@/lib/validations'

// GET /api/webhooks — List all webhooks (ADMIN only)
export async function GET() {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { logs: true } },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { success: true, createdAt: true },
        },
      },
    })

    const data = webhooks.map((wh) => {
      const recentLogs = wh.logs
      const successCount = recentLogs.filter((l) => l.success).length
      const successRate = recentLogs.length > 0
        ? Math.round((successCount / recentLogs.length) * 100)
        : null
      const lastDelivery = recentLogs[0]?.createdAt ?? null

      return {
        id: wh.id,
        name: wh.name,
        url: wh.url,
        events: wh.events,
        active: wh.active,
        createdAt: wh.createdAt,
        totalLogs: wh._count.logs,
        successRate,
        lastDelivery,
      }
    })

    return apiSuccess(data)
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/webhooks')
    return handleApiError(error, '/api/webhooks')
  }
}

// POST /api/webhooks — Create webhook (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const user = result

    const body = await req.json()
    const data = validateRequest(createWebhookSchema, body)

    const secret = `whsec_${crypto.randomBytes(32).toString('hex')}`

    const webhook = await prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        events: data.events,
        secret,
        createdById: user.id,
      },
    })

    // Return secret only at creation time
    return apiCreated({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      secret: webhook.secret,
      createdAt: webhook.createdAt,
    })
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/webhooks')
    return handleApiError(error, '/api/webhooks')
  }
}
