import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'

// GET /api/settings/sla — Return SLA configs + assignment strategy
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser()

    const [configs, strategySetting] = await Promise.all([
      prisma.slaConfig.findMany({ orderBy: { firstResponseHours: 'asc' } }),
      prisma.setting.findUnique({ where: { key: 'ticket_assign_strategy' } }),
    ])

    return apiSuccess({
      configs,
      strategy: (strategySetting?.value as any)?.strategy || 'round_robin',
    })
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/settings/sla')
    return handleApiError(error, '/api/settings/sla')
  }
}

// PUT /api/settings/sla — Update SLA configs + strategy (ADMIN only)
export async function PUT(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const { configs, strategy } = body as {
      configs: Array<{ priority: string; firstResponseHours: number; resolutionHours: number }>
      strategy: string
    }

    // Update SLA configs
    if (configs && Array.isArray(configs)) {
      for (const c of configs) {
        await prisma.slaConfig.upsert({
          where: { priority: c.priority },
          update: {
            firstResponseHours: c.firstResponseHours,
            resolutionHours: c.resolutionHours,
          },
          create: {
            priority: c.priority,
            firstResponseHours: c.firstResponseHours,
            resolutionHours: c.resolutionHours,
          },
        })
      }
    }

    // Update assignment strategy
    if (strategy) {
      await prisma.setting.upsert({
        where: { key: 'ticket_assign_strategy' },
        update: { value: { strategy }, updatedBy: result.id },
        create: { key: 'ticket_assign_strategy', value: { strategy }, updatedBy: result.id },
      })
    }

    return apiSuccess({ success: true })
  } catch (error) {
    if (error instanceof AuthError) return handleApiError(Unauthorized(error.message), '/api/settings/sla')
    return handleApiError(error, '/api/settings/sla')
  }
}
