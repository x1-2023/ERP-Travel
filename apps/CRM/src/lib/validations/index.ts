// ── Validation schemas — single source of truth for server + client ──

export { validateRequest, formatZodErrors } from './utils'

// Entity schemas
export {
  createContactSchema,
  updateContactSchema,
  contactQuerySchema,
  type CreateContactInput,
  type UpdateContactInput,
} from './contact'

export {
  createCompanySchema,
  updateCompanySchema,
  companyQuerySchema,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from './company'

export {
  createDealSchema,
  updateDealSchema,
  dealQuerySchema,
  type CreateDealInput,
  type UpdateDealInput,
} from './deal'

export {
  createQuoteSchema,
  updateQuoteSchema,
  quoteItemSchema,
  sendQuoteSchema,
  type CreateQuoteInput,
  type UpdateQuoteInput,
  type QuoteItemInput,
  type SendQuoteInput,
} from './quote'

export {
  createOrderSchema,
  updateOrderSchema,
  orderQuerySchema,
  orderTransitionSchema,
  type CreateOrderInput,
  type UpdateOrderInput,
  type OrderTransitionInput,
} from './order'

export {
  createCampaignSchema,
  updateCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput,
} from './campaign'

export {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
  type CreateActivityInput,
  type UpdateActivityInput,
} from './activity'

export {
  audienceRuleSchema,
  audienceRuleGroupSchema,
  audienceRulesSchema,
  createAudienceSchema,
  updateAudienceSchema,
  type AudienceRuleInput,
  type AudienceRuleGroupInput,
  type AudienceRulesInput,
  type CreateAudienceInput,
  type UpdateAudienceInput,
} from './audience'

export {
  companySettingsSchema,
  pipelineSettingsSchema,
  notificationSettingsSchema,
  emailSettingsSchema,
  settingsSchemaMap,
} from './settings'

export {
  ticketQuerySchema,
  updateTicketSchema,
  staffTicketMessageSchema,
  isValidTransition,
  VALID_TRANSITIONS,
  type TicketQueryInput,
  type UpdateTicketInput,
  type StaffTicketMessageInput,
} from './ticket'

export {
  portalLoginSchema,
  portalProfileSchema,
  portalCreateTicketSchema,
  portalTicketMessageSchema,
  portalQuoteActionSchema,
  type PortalLoginInput,
  type PortalProfileInput,
  type PortalCreateTicketInput,
  type PortalTicketMessageInput,
  type PortalQuoteActionInput,
} from './portal'

export {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from './webhook'

export {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  type CreateEmailTemplateInput,
  type UpdateEmailTemplateInput,
} from './email-template'

export {
  createExchangeRateSchema,
  updateExchangeRateSchema,
  type CreateExchangeRateInput,
  type UpdateExchangeRateInput,
} from './exchange-rate'

export {
  uploadDocumentSchema,
  updateDocumentSchema,
  type UploadDocumentInput,
  type UpdateDocumentInput,
} from './document'

export {
  screenEntitySchema,
  updateChecklistItemSchema,
  type ScreenEntityInput,
  type UpdateChecklistItemInput,
} from './compliance'
