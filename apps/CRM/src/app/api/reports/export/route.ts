import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { Forbidden, Unauthorized, handleApiError } from '@/lib/api/errors'
import { formatCurrency } from '@/lib/constants'

// GET /api/reports/export — Export sales report as CSV
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!canAccess(user, 'export')) {
      throw Forbidden()
    }

    const { searchParams } = req.nextUrl
    const now = new Date()
    const toDate = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : now
    const fromDate = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)

    const isManager = user.role === 'ADMIN' || user.role === 'MANAGER'
    const ownerFilter = isManager ? {} : { ownerId: user.id }

    const wonStages = await prisma.stage.findMany({
      where: { isWon: true },
      select: { id: true },
    })
    const wonStageIds = wonStages.map((s) => s.id)

    const deals = await prisma.deal.findMany({
      where: {
        stageId: { in: wonStageIds },
        closedAt: { gte: fromDate, lte: toDate },
        ...ownerFilter,
      },
      include: {
        stage: { select: { name: true } },
        company: { select: { name: true } },
        owner: { select: { name: true, email: true } },
        contacts: {
          include: {
            contact: { select: { firstName: true, lastName: true, email: true } },
          },
          take: 1,
        },
      },
      orderBy: { closedAt: 'desc' },
    })

    // Build CSV with BOM for Vietnamese Excel compatibility
    const BOM = '\uFEFF'
    const headers = [
      'Deal',
      'Giá trị',
      'Công ty',
      'Liên hệ',
      'Email LH',
      'Giai đoạn',
      'Ngày đóng',
      'Người phụ trách',
    ]

    const rows = deals.map((deal) => {
      const contact = deal.contacts[0]?.contact
      const contactName = contact
        ? `${contact.firstName} ${contact.lastName}`.trim()
        : ''
      const contactEmail = contact?.email || ''
      const closedAt = deal.closedAt
        ? new Date(deal.closedAt).toLocaleDateString('vi-VN')
        : ''

      return [
        escapeCsv(deal.title),
        Number(deal.value),
        escapeCsv(deal.company?.name || ''),
        escapeCsv(contactName),
        escapeCsv(contactEmail),
        escapeCsv(deal.stage.name),
        closedAt,
        escapeCsv(deal.owner.name || deal.owner.email),
      ].join(',')
    })

    const csv = BOM + headers.join(',') + '\n' + rows.join('\n')

    const filename = `sales-report-${fromDate.toISOString().slice(0, 10)}_${toDate.toISOString().slice(0, 10)}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/reports/export')
    }
    return handleApiError(error, '/api/reports/export')
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
