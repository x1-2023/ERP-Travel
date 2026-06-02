import { prisma } from '@/lib/prisma'
import { eventBus } from '../event-bus'
import { CRM_EVENTS } from '../types'

/**
 * Commission Handler — DEAL_WON → auto-create Commission
 *
 * When a deal is won and has an active partner with APPROVED registration:
 * 1. Find active partner via deal.partnerId
 * 2. Check for APPROVED registration
 * 3. Create Commission record: amount = deal.value * partner.commissionRate / 100
 */
export function registerCommissionHandlers(): void {
  // Listen for deal won via webhook system (emitEvent fires with this shape)
  eventBus.on(CRM_EVENTS.DEAL_WON, async (payload: unknown) => {
    try {
      const { dealId } = payload as { dealId: string }
      if (!dealId) return

      // Fetch deal with partner info
      const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        select: {
          id: true,
          title: true,
          value: true,
          currency: true,
          partnerId: true,
          partner: {
            select: {
              id: true,
              commissionRate: true,
              isActive: true,
            },
          },
        },
      })

      if (!deal?.partnerId || !deal.partner) return
      if (!deal.partner.isActive) return

      // Check for APPROVED registration
      const registration = await prisma.dealRegistration.findFirst({
        where: {
          dealId: deal.id,
          partnerId: deal.partnerId,
          status: 'APPROVED',
        },
      })

      if (!registration) return

      // Check if commission already exists for this deal+partner
      const existingCommission = await prisma.commission.findFirst({
        where: {
          dealId: deal.id,
          partnerId: deal.partnerId,
        },
      })

      if (existingCommission) return // Already created

      // Calculate commission
      const dealValue = Number(deal.value)
      const rate = deal.partner.commissionRate
      const amount = dealValue * rate / 100

      await prisma.commission.create({
        data: {
          dealId: deal.id,
          partnerId: deal.partnerId,
          amount,
          rate,
          currency: deal.currency || 'VND',
          status: 'PENDING',
        },
      })

      console.log(
        `[Commission] Created commission for deal "${deal.title}": ${amount} (${rate}%)`
      )
    } catch (error) {
      console.error('[Commission] Error creating commission on DEAL_WON:', error)
    }
  })
}
