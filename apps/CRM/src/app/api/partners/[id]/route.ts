import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'
import { updatePartnerSchema } from '@/lib/validations/partner'

// GET /api/partners/[id] — Partner detail
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        company: { select: { id: true, name: true, country: true, logoUrl: true, industry: true } },
        registrations: {
          include: {
            deal: { select: { id: true, title: true, value: true, currency: true } },
            approvedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        commissions: {
          include: {
            deal: { select: { id: true, title: true, value: true, currency: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        deals: {
          include: {
            stage: { select: { id: true, name: true, color: true, isWon: true } },
            company: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { deals: true, commissions: true, registrations: true } },
      },
    })

    if (!partner) return handleApiError(NotFound('Partner'), '/api/partners/[id]')

    // Calculate stats
    const totalCommissionPaid = partner.commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0)
    const totalCommissionPending = partner.commissions
      .filter((c) => c.status !== 'PAID')
      .reduce((sum, c) => sum + c.amount, 0)
    const wonDeals = partner.deals.filter((d) => d.stage.isWon).length
    const pipelineValue = partner.deals
      .filter((d) => !d.stage.isWon)
      .reduce((sum, d) => sum + Number(d.value), 0)

    return NextResponse.json({
      ...partner,
      stats: { totalCommissionPaid, totalCommissionPending, wonDeals, pipelineValue },
    })
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]')
  }
}

// PATCH /api/partners/[id] — Update partner
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = updatePartnerSchema.parse(body)

    const existing = await prisma.partner.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Partner'), '/api/partners/[id]')

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        ...(data.partnerType !== undefined && { partnerType: data.partnerType }),
        ...(data.territory !== undefined && { territory: data.territory }),
        ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
        ...(data.certificationLevel !== undefined && { certificationLevel: data.certificationLevel }),
        ...(data.contractStartDate !== undefined && { contractStartDate: new Date(data.contractStartDate) }),
        ...(data.contractEndDate !== undefined && { contractEndDate: new Date(data.contractEndDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(partner)
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]')
  }
}

// DELETE /api/partners/[id] — Soft delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.partner.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Partner'), '/api/partners/[id]')

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json(partner)
  } catch (error) {
    return handleApiError(error, '/api/partners/[id]')
  }
}
