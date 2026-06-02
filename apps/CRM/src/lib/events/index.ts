export { eventBus } from './event-bus'
export { CRM_EVENTS } from './types'
export type {
  CrmEventName,
  BaseEventPayload,
  ContactEventPayload,
  DealEventPayload,
  DealStageEventPayload,
  QuoteEventPayload,
  QuoteExpiringPayload,
  OrderEventPayload,
  OrderStatusEventPayload,
  TicketEventPayload,
  TicketStaffRepliedPayload,
  CampaignEventPayload,
} from './types'
export { initializeEventHandlers } from './handlers'

// ── Self-initialize on module load ──────────────────────────────
import { initializeEventHandlers } from './handlers'
initializeEventHandlers()
