import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'
import { commissionUpdateSchema } from '@/lib/validations/partner'

// PATCH /api/commissions/[id] — Update commission status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = commissionUpdateSchema.parse(body)

    const existing = await prisma.commission.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Commission'), '/api/commissions/[id]')

    const commission = await prisma.commission.update({
      where: { id: params.id },
      data: {
        status: data.status,
        ...(data.status === 'PAID' && { paidAt: new Date() }),
        ...(data.invoiceNumber && { invoiceNumber: data.invoiceNumber }),
        ...(data.notes && { notes: data.notes }),
      },
      include: {
        deal: { select: { id: true, title: true } },
        partner: { include: { company: { select: { name: true } } } },
      },
    })

    return NextResponse.json(commission)
  } catch (error) {
    return handleApiError(error, '/api/commissions/[id]')
  }
}
