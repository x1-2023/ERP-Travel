import { registerNotificationHandlers } from './notification-handler'
import { registerWebhookHandlers } from './webhook-handler'
import { registerEmailNotificationHandlers } from './email-notification-handler'
import { registerOrderAutomationHandlers } from './order-automation-handler'
import { registerCommissionHandlers } from './commission-handler'

let initialized = false

/**
 * Register all event handlers. Idempotent — only registers once.
 */
export function initializeEventHandlers(): void {
  if (initialized) return
  initialized = true

  registerNotificationHandlers()
  registerWebhookHandlers()
  registerEmailNotificationHandlers()
  registerOrderAutomationHandlers()
  registerCommissionHandlers()
}
