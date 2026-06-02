// ── Settings Types ────────────────────────────────────────────────────

export interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  taxId: string
  logo?: string
}

export interface PipelineStage {
  id: string
  name: string
  color: string
  probability: number
  order: number
}

export interface PipelineSettings {
  stages: PipelineStage[]
}

export interface NotificationSettings {
  quoteExpiryReminder: boolean
  quoteExpiryDays: number
  dealStaleAlertDays: number
  emailOnNewDeal: boolean
}

export interface EmailSettings {
  fromName: string
  fromEmail: string
  replyTo: string
  signature: string
}

export interface OrderSettings {
  autoOrderFromQuote: boolean
}

export type SettingsKey = 'company' | 'pipeline' | 'notifications' | 'email' | 'order'

export type SettingsMap = {
  company: CompanySettings
  pipeline: PipelineSettings
  notifications: NotificationSettings
  email: EmailSettings
  order: OrderSettings
}
