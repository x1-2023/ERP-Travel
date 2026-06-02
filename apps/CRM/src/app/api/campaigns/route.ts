import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, createCampaignSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'
import { sanitizeObject, sanitizeHtml } from '@/lib/api/sanitize'

// GET /api/campaigns — List campaigns (MANAGER+ sees all, others filtered)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status')
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))

    const where: any = {}

    if (!canAccess(user, 'manage_campaigns')) {
      where.createdById = user.id
    }

    if (status) where.status = status

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        audience: { select: { id: true, name: true, _count: { select: { members: true } } } },
        _count: { select: { sends: true, variants: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/campaigns error:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

// POST /api/campaigns — Create campaign (ADMIN, MANAGER only)
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result
    const body = await req.json()
    const validated = validateRequest(createCampaignSchema, body)
    const data = sanitizeObject(validated)
    const sanitizedContent = data.content ? sanitizeHtml(data.content) : ''

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        subject: data.subject || '',
        content: sanitizedContent,
        type: data.type,
        audienceId: data.audienceId || undefined,
        scheduledAt: data.scheduledAt || undefined,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        createdById: user.id,
        variants: {
          create: {
            name: 'Original',
            subject: data.subject || '',
            content: sanitizedContent,
            splitPercent: 100,
          },
        },
      },
      include: {
        variants: true,
        audience: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/campaigns')
  }
}
