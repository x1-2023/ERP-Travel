import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'

// GET /api/portal/dashboard — Real stats for portal dashboard
export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = session.portalUser

  const [
    pendingQuotes,
    activeOrders,
    openTickets,
    recentQuotes,
    recentOrders,
    recentTickets,
  ] = await Promise.all([
    // Quotes that need attention (SENT or VIEWED)
    prisma.quote.count({
      where: { companyId, status: { in: ['SENT', 'VIEWED'] } },
    }),
    // Orders that are not yet delivered/cancelled
    prisma.salesOrder.count({
      where: {
        companyId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED'] },
      },
    }),
    // Open/in-progress tickets
    prisma.supportTicket.count({
      where: {
        companyId,
        status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] },
      },
    }),
    // 3 most recent quotes
    prisma.quote.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        quoteNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
    // 3 most recent orders
    prisma.salesOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
    }),
    // 3 most recent tickets
    prisma.supportTicket.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({
    stats: { pendingQuotes, activeOrders, openTickets },
    recent: {
      quotes: recentQuotes,
      orders: recentOrders,
      tickets: recentTickets,
    },
  })
}
