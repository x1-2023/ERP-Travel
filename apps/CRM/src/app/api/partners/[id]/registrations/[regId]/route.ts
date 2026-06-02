import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'
import { registrationActionSchema } from '@/lib/validations/partner'

// PATCH /api/partners/[id]/registrations/[regId] — Approve/Reject
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; regId: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result

    const body = await req.json()
    const data = registrationActionSchema.parse(body)

    const registration = await prisma.dealRegistration.findUnique({
      where: { id: params.regId },
      include: { partner: true },
    })
    if (!registration) return handleApiError(NotFound('Registration'), '/api/partners/[id]/registrations/[regId]')

    if (registration.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only approve/reject PENDING registrations' },
        { status: 400 }
      )
    }

    if (data.status === 'APPROVED') {
      // Approve: set approvedBy, link partner to deal
      const updated = await prisma.$transaction([
        prisma.dealRegistration.update({
          where: { id: params.regId },
          data: {
            status: 'APPROVED',
            approvedById: user.id,
            approvedAt: new Date(),
          },
        }),
        prisma.deal.update({
          where: { id: registration.dealId },
          data: { partnerId: registration.partnerId },
        }),
      ])

      return NextResponse.json(updated[0])
    }

    // Reject
    const updated = await prisma.dealRegistration.update({
      where: { id: params.regId },
      data: {
        status: 'REJECTED',
        rejectionNote: data.rejectionNote,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]/registrations/[regId]')
  }
}
