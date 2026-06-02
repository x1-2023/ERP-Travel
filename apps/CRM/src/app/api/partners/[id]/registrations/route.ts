import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'
import { dealRegistrationSchema } from '@/lib/validations/partner'

// GET /api/partners/[id]/registrations — List registrations
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const registrations = await prisma.dealRegistration.findMany({
      where: { partnerId: params.id },
      include: {
        deal: { select: { id: true, title: true, value: true, currency: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: registrations })
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]/registrations')
  }
}

// POST /api/partners/[id]/registrations — Create registration
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = dealRegistrationSchema.parse({ ...body, partnerId: params.id })

    // Validate partner exists
    const partner = await prisma.partner.findUnique({ where: { id: params.id } })
    if (!partner) return handleApiError(NotFound('Partner'), '/api/partners/[id]/registrations')

    // Check deal not already registered by another partner
    const existingReg = await prisma.dealRegistration.findFirst({
      where: {
        dealId: data.dealId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    })
    if (existingReg) {
      return NextResponse.json(
        { error: 'Deal already has an active registration' },
        { status: 400 }
      )
    }

    // Default expiry: +90 days
    const expiresAt = data.expiresAt
      ? new Date(data.expiresAt)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    const registration = await prisma.dealRegistration.create({
      data: {
        dealId: data.dealId,
        partnerId: params.id,
        expiresAt,
        notes: data.notes,
      },
      include: {
        deal: { select: { id: true, title: true, value: true } },
        partner: { include: { company: { select: { name: true } } } },
      },
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]/registrations')
  }
}
