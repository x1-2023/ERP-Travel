import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { validateRequest } from '@/lib/validations/utils'
import { updateAudienceSchema } from '@/lib/validations/audience'
import { countAudienceByRules } from '@/lib/campaigns/rule-engine'
import { handleApiError } from '@/lib/api/errors'
import type { AudienceRules } from '@/lib/audience-fields'

// GET /api/audiences/[id] — Authenticated users can view
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getCurrentUser()

    const audience = await prisma.audience.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            contact: {
              select: { id: true, firstName: true, lastName: true, email: true, status: true, company: { select: { name: true } } },
            },
          },
        },
      },
    })

    if (!audience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    // For DYNAMIC, add resolved count
    if (audience.type === 'DYNAMIC' && audience.rules) {
      const dynamicCount = await countAudienceByRules(audience.rules as unknown as AudienceRules)
      return NextResponse.json({ ...audience, _dynamicCount: dynamicCount })
    }

    return NextResponse.json(audience)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Failed to fetch audience' }, { status: 500 })
  }
}

// PATCH /api/audiences/[id] — ADMIN, MANAGER only
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = validateRequest(updateAudienceSchema, body)

    const audience = await prisma.audience.update({
      where: { id: params.id },
      data,
      include: {
        _count: { select: { members: true } },
      },
    })

    return NextResponse.json(audience)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, 'PATCH /api/audiences/[id]')
  }
}

// DELETE /api/audiences/[id] — ADMIN, MANAGER only
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.audience.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete audience' }, { status: 500 })
  }
}
