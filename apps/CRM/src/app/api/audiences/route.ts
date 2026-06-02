import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { validateRequest } from '@/lib/validations/utils'
import { createAudienceSchema } from '@/lib/validations/audience'
import { countAudienceByRules } from '@/lib/campaigns/rule-engine'
import { handleApiError } from '@/lib/api/errors'
import type { AudienceRules } from '@/lib/audience-fields'

// GET /api/audiences — List audiences (authenticated)
export async function GET() {
  try {
    await getCurrentUser()

    const audiences = await prisma.audience.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // For DYNAMIC audiences, compute resolved count
    const enriched = await Promise.all(
      audiences.map(async (a) => {
        if (a.type === 'DYNAMIC' && a.rules) {
          const dynamicCount = await countAudienceByRules(a.rules as unknown as AudienceRules)
          return { ...a, _count: { ...a._count, members: dynamicCount } }
        }
        return a
      })
    )

    return NextResponse.json(enriched)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/audiences error:', error)
    return NextResponse.json({ error: 'Failed to fetch audiences' }, { status: 500 })
  }
}

// POST /api/audiences — ADMIN, MANAGER only
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result

    const body = await req.json()
    const data = validateRequest(createAudienceSchema, body)

    const audience = await prisma.audience.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        rules: data.rules || undefined,
        createdById: user.id,
        members: data.contactIds?.length
          ? {
              create: data.contactIds.map((contactId: string) => ({
                contactId,
              })),
            }
          : undefined,
      },
      include: {
        _count: { select: { members: true } },
      },
    })

    return NextResponse.json(audience, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, 'POST /api/audiences')
  }
}
