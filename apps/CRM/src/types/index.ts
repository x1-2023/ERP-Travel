export type { Company, Contact, Deal, Stage, PipelineConfig, Activity, Quote, QuoteItem, SalesOrder, OrderItem, Product, Tag, User, AuditLog, DealContact, ContactTag, CompanyTag, DealTag, ExchangeRate, Document, ComplianceCheck, DealChecklist, ProductBundle, ProductBundleItem, ProductCompatibility, PricingTier, Partner, DealRegistration, Commission } from '@prisma/client'

export type ContactWithCompany = import('@prisma/client').Contact & {
  company: import('@prisma/client').Company | null
  tags: (import('@prisma/client').ContactTag & { tag: import('@prisma/client').Tag })[]
}

export type CompanyWithContacts = import('@prisma/client').Company & {
  contacts: import('@prisma/client').Contact[]
  deals: import('@prisma/client').Deal[]
  tags: (import('@prisma/client').CompanyTag & { tag: import('@prisma/client').Tag })[]
  parent?: { id: string; name: string } | null
  children?: { id: string; name: string }[]
  _count: { contacts: number; deals: number; documents?: number }
}

export type DealWithRelations = import('@prisma/client').Deal & {
  stage: import('@prisma/client').Stage
  company: (import('@prisma/client').Company & {
    parent?: { id: string; name: string } | null
    children?: { id: string; name: string }[]
  }) | null
  contacts: (import('@prisma/client').DealContact & { contact: import('@prisma/client').Contact })[]
  owner: import('@prisma/client').User
  checklists?: import('@prisma/client').DealChecklist[]
  _count: { activities: number; quotes: number; documents?: number }
}

export type DocumentWithUploader = import('@prisma/client').Document & {
  uploadedBy: { id: string; name: string | null; avatarUrl: string | null }
}

export type StageWithDeals = import('@prisma/client').Stage & {
  deals: DealWithRelations[]
}

export type ActivityWithRelations = import('@prisma/client').Activity & {
  contact: import('@prisma/client').Contact | null
  company: import('@prisma/client').Company | null
  deal: import('@prisma/client').Deal | null
  user: import('@prisma/client').User
}

export type QuoteWithItems = import('@prisma/client').Quote & {
  items: (import('@prisma/client').QuoteItem & { product: import('@prisma/client').Product | null })[]
  contact: import('@prisma/client').Contact | null
  company: import('@prisma/client').Company | null
  deal: import('@prisma/client').Deal | null
}

export type OrderWithItems = import('@prisma/client').SalesOrder & {
  items: (import('@prisma/client').OrderItem & { product: import('@prisma/client').Product | null })[]
  company: import('@prisma/client').Company | null
  deal: import('@prisma/client').Deal | null
}

export interface DashboardStats {
  activeDeals: number
  activeDealsChange: number
  pipelineValue: number
  pipelineValueChange: number
  wonThisMonth: number
  wonRevenue: number
  conversionRate: number
  conversionRateChange: number
}

export interface FunnelData {
  stage: string
  count: number
  value: number
  color: string
}

export interface RevenueData {
  month: string
  revenue: number
  deals: number
}

// ── Analytics types ──────────────────────────────────────────────────

export interface AnalyticsKPIs {
  totalRevenue: number
  totalRevenueChange: number
  activeDeals: number
  activeDealsChange: number
  newContacts: number
  newContactsChange: number
  conversionRate: number
  conversionRateChange: number
  totalQuotes: number
  totalQuotesChange: number
  totalOrders: number
  totalOrdersChange: number
  avgDealValue: number
  avgDealValueChange: number
  activitiesCount: number
  activitiesCountChange: number
  openTickets: number
  openTicketsChange: number
  slaBreached: number
  slaBreachedChange: number
}

export interface PipelineFunnelItem {
  stage: string
  count: number
  value: number
  color: string
}

export interface DealsOverTimeItem {
  month: string
  won: number
  lost: number
  revenue: number
}

export interface QuotesByStatusItem {
  status: string
  count: number
  color: string
}

export interface TopContactItem {
  name: string
  totalValue: number
  deals: number
}

export interface CampaignPerformanceItem {
  name: string
  sent: number
  opened: number
  clicked: number
  bounced: number
  openRate: number
}

export interface ActivityByTypeItem {
  type: string
  count: number
  color: string
}

export interface AnalyticsCharts {
  pipelineFunnel: PipelineFunnelItem[]
  dealsOverTime: DealsOverTimeItem[]
  quotesByStatus: QuotesByStatusItem[]
  topContacts: TopContactItem[]
  campaignPerformance: CampaignPerformanceItem[]
  activityByType: ActivityByTypeItem[]
}

export interface AnalyticsDashboard {
  period: { from: string; to: string }
  kpis: AnalyticsKPIs
  charts: AnalyticsCharts
}
