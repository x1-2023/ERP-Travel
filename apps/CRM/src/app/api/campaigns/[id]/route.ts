import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, updateCampaignSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'
import { sanitizeObject, sanitizeHtml } from '@/lib/api/sanitize'

// GET /api/campaigns/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        audience: {
          include: {
            members: {
              include: { contact: { select: { id: true, firstName: true, lastName: true, email: true } } },
              take: 100,
            },
            _count: { select: { members: true } },
          },
        },
        variants: true,
        sends: {
          include: {
            contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
        createdBy: { select: { id: true, name: true } },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!canAccess(user, 'manage_campaigns') && campaign.createdById !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bạn không có quyền xem chiến dịch này' },
        { status: 403 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/campaigns/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

// PATCH /api/campaigns/[id] — ADMIN, MANAGER only
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const validated = validateRequest(updateCampaignSchema, body)
    const data = sanitizeObject(validated)
    if (data.content) {
      data.content = sanitizeHtml(data.content)
    }

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: data as any,
      include: { variants: true, audience: { select: { id: true, name: true } } },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    return handleApiError(error, '/api/campaigns/[id]')
  }
}

// DELETE /api/campaigns/[id] — ADMIN, MANAGER only
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.campaign.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
