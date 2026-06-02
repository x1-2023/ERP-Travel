import { eventBus } from '../event-bus'
import { prisma } from '@/lib/prisma'
import { deliverWithRetry } from '@/lib/webhooks/delivery'

/**
 * Register webhook handler that delivers events to subscribed webhooks.
 * Uses eventBus.onAny() to catch all CRM events.
 */
export function registerWebhookHandlers(): void {
  eventBus.onAny(async (event: string, payload: unknown) => {
    try {
      // Find active webhooks subscribed to this event
      const webhooks = await prisma.webhook.findMany({
        where: {
          active: true,
          events: { has: event },
        },
        select: { id: true, url: true, secret: true },
      })

      if (webhooks.length === 0) return

      // Deliver to each webhook (parallel, fire-and-forget)
      for (const webhook of webhooks) {
        deliverWithRetry(webhook, event, payload).catch((err) => {
          console.error(`[Webhook] Delivery error for ${webhook.id}:`, err)
        })
      }
    } catch (err) {
      console.error('[Webhook] Handler error:', err)
    }
  })
}
