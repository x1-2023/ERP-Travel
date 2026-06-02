import { eventBus } from '../event-bus'
import { CRM_EVENTS } from '../types'
import type { QuoteEventPayload } from '../types'
import { prisma } from '@/lib/prisma'
import { getSettingOrDefault } from '@/lib/settings'
import { notifyUser } from '@/lib/notifications'

/**
 * Auto-generate order number: ORD-YYYY-NNNN
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `ORD-${year}-`

  const lastOrder = await prisma.salesOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })

  let nextNum = 1
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.orderNumber.replace(prefix, ''))
    if (!isNaN(lastNum)) nextNum = lastNum + 1
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`
}

/**
 * Register handler that auto-creates a SalesOrder when a quote is accepted.
 * Checks the 'order.autoOrderFromQuote' setting before proceeding.
 */
export function registerOrderAutomationHandlers(): void {
  eventBus.on(CRM_EVENTS.QUOTE_ACCEPTED, async (payload) => {
    const p = payload as QuoteEventPayload

    try {
      // Check if auto-order is enabled
      const orderSettings = await getSettingOrDefault('order')
      if (!orderSettings.autoOrderFromQuote) return

      // Check if order already exists for this quote
      const existing = await prisma.salesOrder.findFirst({
        where: { quoteId: p.quoteId },
      })
      if (existing) return

      // Fetch quote with items
      const quote = await prisma.quote.findUnique({
        where: { id: p.quoteId },
        include: { items: true },
      })
      if (!quote) return

      const orderNumber = await generateOrderNumber()

      const orderItems = quote.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        description: item.description,
        productId: item.productId || undefined,
      }))

      const subtotal = orderItems.reduce((sum, item) => sum + Number(item.total), 0)
      const taxAmount = subtotal * Number(quote.taxPercent) / 100
      const total = subtotal + taxAmount

      const order = await prisma.salesOrder.create({
        data: {
          orderNumber,
          companyId: quote.companyId || undefined,
          dealId: quote.dealId || undefined,
          quoteId: quote.id,
          notes: `Tự động tạo từ báo giá ${quote.quoteNumber}`,
          subtotal,
          taxAmount,
          total,
          createdById: quote.createdById,
          items: {
            create: orderItems,
          },
        },
      })

      // Emit ORDER_CREATED event
      eventBus.emit(CRM_EVENTS.ORDER_CREATED, {
        timestamp: new Date().toISOString(),
        userId: quote.createdById,
        orderId: order.id,
        order: { orderNumber: order.orderNumber, total: Number(order.total), status: order.status },
        ownerId: quote.createdById,
      }).catch(() => {})

      // Notify quote owner
      await notifyUser(
        quote.createdById,
        'ORDER_STATUS_CHANGED',
        {
          orderNumber: order.orderNumber,
          statusLabel: `Tự động tạo từ ${quote.quoteNumber}`,
        },
        `/orders/${order.id}`
      )
    } catch (err) {
      console.error('[OrderAutomation] Failed to auto-create order:', err)
    }
  })
}
