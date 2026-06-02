export const DEFAULT_STAGES = [
  { name: 'New Lead', labelKey: 'pipeline.stageNewLead', order: 0, probability: 10, color: '#6B7280', isWon: false, isLost: false },
  { name: 'Qualification', labelKey: 'pipeline.stageQualification', order: 1, probability: 20, color: '#3B82F6', isWon: false, isLost: false },
  { name: 'Proposal', labelKey: 'pipeline.stageProposal', order: 2, probability: 50, color: '#8B5CF6', isWon: false, isLost: false },
  { name: 'Negotiation', labelKey: 'pipeline.stageNegotiation', order: 3, probability: 75, color: '#F59E0B', isWon: false, isLost: false },
  { name: 'Closed Won', labelKey: 'pipeline.stageClosedWon', order: 4, probability: 100, color: '#10B981', isWon: true, isLost: false },
  { name: 'Closed Lost', labelKey: 'pipeline.stageClosedLost', order: 5, probability: 0, color: '#EF4444', isWon: false, isLost: true },
]

export const ACTIVITY_TYPES = [
  { value: 'CALL', labelKey: 'activity.call', icon: 'Phone' },
  { value: 'EMAIL', labelKey: 'activity.email', icon: 'Mail' },
  { value: 'MEETING', labelKey: 'activity.meeting', icon: 'Users' },
  { value: 'TASK', labelKey: 'activity.task', icon: 'CheckSquare' },
  { value: 'NOTE', labelKey: 'activity.note', icon: 'FileText' },
  { value: 'LUNCH', labelKey: 'activity.lunch', icon: 'Coffee' },
  { value: 'DEMO', labelKey: 'activity.demo', icon: 'Monitor' },
  { value: 'FOLLOW_UP', labelKey: 'activity.followUp', icon: 'ArrowRight' },
] as const

export const LEAD_SOURCES = [
  { value: 'WEBSITE', labelKey: 'source.website' },
  { value: 'REFERRAL', labelKey: 'source.referral' },
  { value: 'COLD_CALL', labelKey: 'source.coldCall' },
  { value: 'EMAIL', labelKey: 'source.email' },
  { value: 'SOCIAL_MEDIA', labelKey: 'source.socialMedia' },
  { value: 'TRADE_SHOW', labelKey: 'source.tradeShow' },
  { value: 'ADVERTISEMENT', labelKey: 'source.advertisement' },
  { value: 'PARTNER', labelKey: 'source.partner' },
  { value: 'OTHER', labelKey: 'source.other' },
] as const

export const COMPANY_SIZES = [
  { value: 'SOLO', labelKey: 'companySize.solo' },
  { value: 'SMALL', labelKey: 'companySize.small' },
  { value: 'MEDIUM', labelKey: 'companySize.medium' },
  { value: 'LARGE', labelKey: 'companySize.large' },
  { value: 'ENTERPRISE', labelKey: 'companySize.enterprise' },
] as const

export const CONTACT_STATUSES = [
  { value: 'LEAD', labelKey: 'contactStatus.lead', color: '#F59E0B' },
  { value: 'ACTIVE', labelKey: 'contactStatus.active', color: '#10B981' },
  { value: 'CUSTOMER', labelKey: 'contactStatus.customer', color: '#3B82F6' },
  { value: 'INACTIVE', labelKey: 'contactStatus.inactive', color: '#6B7280' },
  { value: 'CHURNED', labelKey: 'contactStatus.churned', color: '#EF4444' },
] as const

export const QUOTE_STATUSES = [
  { value: 'DRAFT', labelKey: 'quoteStatus.draft', color: '#6B7280' },
  { value: 'SENT', labelKey: 'quoteStatus.sent', color: '#3B82F6' },
  { value: 'VIEWED', labelKey: 'quoteStatus.viewed', color: '#8B5CF6' },
  { value: 'ACCEPTED', labelKey: 'quoteStatus.accepted', color: '#10B981' },
  { value: 'REJECTED', labelKey: 'quoteStatus.rejected', color: '#EF4444' },
  { value: 'EXPIRED', labelKey: 'quoteStatus.expired', color: '#F59E0B' },
] as const

export const ORDER_STATUSES = [
  { value: 'PENDING', labelKey: 'orderStatus.pending', color: '#F59E0B' },
  { value: 'CONFIRMED', labelKey: 'orderStatus.confirmed', color: '#3B82F6' },
  { value: 'IN_PRODUCTION', labelKey: 'orderStatus.inProduction', color: '#8B5CF6' },
  { value: 'SHIPPED', labelKey: 'orderStatus.shipped', color: '#06B6D4' },
  { value: 'DELIVERED', labelKey: 'orderStatus.delivered', color: '#10B981' },
  { value: 'CANCELLED', labelKey: 'orderStatus.cancelled', color: '#EF4444' },
  { value: 'REFUNDED', labelKey: 'orderStatus.refunded', color: '#6B7280' },
] as const

// ── Multi-Currency ─────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = [
  { code: 'VND', symbol: '₫', name: 'Việt Nam Đồng', locale: 'vi-VN', flag: '🇻🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', flag: '🇪🇺' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', flag: '🇦🇪' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', flag: '🇮🇳' },
] as const

export function getCurrencyInfo(code: string) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0]
}

export function formatCurrency(value: number, currency = 'VND', locale?: string): string {
  const info = getCurrencyInfo(currency)
  return new Intl.NumberFormat(locale ?? info.locale, { style: 'currency', currency }).format(value)
}

// ── Deal Contact Roles ─────────────────────────────────────────────

export const DEAL_CONTACT_ROLES = [
  { value: 'DECISION_MAKER', labelKey: 'dealRole.decisionMaker', color: '#EF4444', icon: 'Crown' },
  { value: 'BUDGET_HOLDER', labelKey: 'dealRole.budgetHolder', color: '#F59E0B', icon: 'DollarSign' },
  { value: 'TECHNICAL_EVALUATOR', labelKey: 'dealRole.technicalEvaluator', color: '#3B82F6', icon: 'Cpu' },
  { value: 'INFLUENCER', labelKey: 'dealRole.influencer', color: '#EC4899', icon: 'Megaphone' },
  { value: 'CHAMPION', labelKey: 'dealRole.champion', color: '#10B981', icon: 'Star' },
  { value: 'GATEKEEPER', labelKey: 'dealRole.gatekeeper', color: '#6366F1', icon: 'Shield' },
  { value: 'END_USER', labelKey: 'dealRole.endUser', color: '#6B7280', icon: 'User' },
  { value: 'PROCUREMENT', labelKey: 'dealRole.procurement', color: '#8B5CF6', icon: 'FileText' },
  { value: 'OTHER', labelKey: 'dealRole.other', color: '#9CA3AF', icon: 'MoreHorizontal' },
] as const

// ── Deal Types ─────────────────────────────────────────────────────

export const DEAL_TYPES = [
  { value: 'GOVERNMENT', labelKey: 'dealType.government', color: '#1D4ED8' },
  { value: 'COMMERCIAL', labelKey: 'dealType.commercial', color: '#10B981' },
  { value: 'ACADEMIC', labelKey: 'dealType.academic', color: '#8B5CF6' },
  { value: 'PARTNER', labelKey: 'dealType.partner', color: '#F59E0B' },
] as const

// ── Compliance Statuses ────────────────────────────────────────────

export const COMPLIANCE_STATUSES = [
  { value: 'NOT_CHECKED', labelKey: 'compliance.notChecked', color: '#6B7280' },
  { value: 'CLEAR', labelKey: 'compliance.clear', color: '#10B981' },
  { value: 'FLAGGED', labelKey: 'compliance.flagged', color: '#F59E0B' },
  { value: 'BLOCKED', labelKey: 'compliance.blocked', color: '#EF4444' },
  { value: 'REVIEW_REQUIRED', labelKey: 'compliance.reviewRequired', color: '#3B82F6' },
] as const

// ── Default Checklists per Deal Type ───────────────────────────────

export const DEFAULT_CHECKLISTS: Record<string, Array<{ key: string; labelKey: string }>> = {
  GOVERNMENT: [
    { key: 'ndaa_compliant', labelKey: 'checklist.ndaaCompliant' },
    { key: 'blue_uas_approved', labelKey: 'checklist.blueUasApproved' },
    { key: 'end_use_cert', labelKey: 'checklist.endUseCert' },
    { key: 'itar_reviewed', labelKey: 'checklist.itarReviewed' },
    { key: 'budget_confirmed', labelKey: 'checklist.budgetConfirmed' },
  ],
  COMMERCIAL: [
    { key: 'nda_signed', labelKey: 'checklist.ndaSigned' },
    { key: 'credit_check', labelKey: 'checklist.creditCheck' },
    { key: 'insurance_verified', labelKey: 'checklist.insuranceVerified' },
  ],
  ACADEMIC: [
    { key: 'mou_signed', labelKey: 'checklist.mouSigned' },
    { key: 'research_purpose_verified', labelKey: 'checklist.researchPurposeVerified' },
  ],
}

// ── Product Categories ────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { value: 'DRONE', labelKey: 'products.category.DRONE', icon: 'Plane' },
  { value: 'PAYLOAD', labelKey: 'products.category.PAYLOAD', icon: 'Package' },
  { value: 'CAMERA', labelKey: 'products.category.CAMERA', icon: 'Camera' },
  { value: 'TRAINING', labelKey: 'products.category.TRAINING', icon: 'GraduationCap' },
  { value: 'MAINTENANCE', labelKey: 'products.category.MAINTENANCE', icon: 'Wrench' },
  { value: 'SOFTWARE', labelKey: 'products.category.SOFTWARE', icon: 'Code' },
  { value: 'SPARE_PART', labelKey: 'products.category.SPARE_PART', icon: 'Cog' },
  { value: 'ACCESSORY', labelKey: 'products.category.ACCESSORY', icon: 'Puzzle' },
  { value: 'OTHER', labelKey: 'products.category.OTHER', icon: 'Box' },
] as const

// ── Bundle Types ──────────────────────────────────────────────────────

export const BUNDLE_TYPES = [
  { value: 'PACKAGE', labelKey: 'bundles.type.PACKAGE', color: '#3B82F6' },
  { value: 'KIT', labelKey: 'bundles.type.KIT', color: '#8B5CF6' },
  { value: 'SERVICE_PLAN', labelKey: 'bundles.type.SERVICE_PLAN', color: '#10B981' },
] as const

// ── Customer Tiers ────────────────────────────────────────────────────

export const CUSTOMER_TIERS = [
  { value: 'GOVERNMENT', labelKey: 'bundles.tier.GOVERNMENT', color: '#1D4ED8' },
  { value: 'COMMERCIAL', labelKey: 'bundles.tier.COMMERCIAL', color: '#10B981' },
  { value: 'ACADEMIC', labelKey: 'bundles.tier.ACADEMIC', color: '#8B5CF6' },
  { value: 'PARTNER', labelKey: 'bundles.tier.PARTNER', color: '#F59E0B' },
] as const

// ── Document Categories ────────────────────────────────────────────

export const DOCUMENT_CATEGORIES = [
  { value: 'PROPOSAL', labelKey: 'document.proposal', icon: 'FileText' },
  { value: 'CONTRACT', labelKey: 'document.contract', icon: 'FileCheck' },
  { value: 'NDA', labelKey: 'document.nda', icon: 'Shield' },
  { value: 'COMPLIANCE', labelKey: 'document.compliance', icon: 'ShieldCheck' },
  { value: 'TECHNICAL', labelKey: 'document.technical', icon: 'Cpu' },
  { value: 'CERTIFICATE', labelKey: 'document.certificate', icon: 'Award' },
  { value: 'INVOICE', labelKey: 'document.invoice', icon: 'Receipt' },
  { value: 'OTHER', labelKey: 'document.other', icon: 'File' },
] as const

// ── Partner Constants ──────────────────────────────────────────────

export const PARTNER_TYPES = [
  { value: 'RESELLER', labelKey: 'partner.type.reseller', color: '#3B82F6' },
  { value: 'INTEGRATOR', labelKey: 'partner.type.integrator', color: '#8B5CF6' },
  { value: 'DISTRIBUTOR', labelKey: 'partner.type.distributor', color: '#F59E0B' },
  { value: 'REFERRAL', labelKey: 'partner.type.referral', color: '#10B981' },
  { value: 'OEM', labelKey: 'partner.type.oem', color: '#EF4444' },
  { value: 'CONSULTANT', labelKey: 'partner.type.consultant', color: '#6366F1' },
] as const

export const CERTIFICATION_LEVELS = [
  { value: 'BRONZE', labelKey: 'partner.cert.bronze', color: '#CD7F32' },
  { value: 'SILVER', labelKey: 'partner.cert.silver', color: '#9CA3AF' },
  { value: 'GOLD', labelKey: 'partner.cert.gold', color: '#F59E0B' },
  { value: 'PLATINUM', labelKey: 'partner.cert.platinum', color: '#6366F1' },
] as const

export const COMMISSION_STATUSES = [
  { value: 'PENDING', labelKey: 'partner.commission.pending', color: '#F59E0B' },
  { value: 'APPROVED', labelKey: 'partner.commission.approved', color: '#3B82F6' },
  { value: 'PAID', labelKey: 'partner.commission.paid', color: '#10B981' },
  { value: 'CANCELLED', labelKey: 'partner.commission.cancelled', color: '#EF4444' },
] as const

export const REGISTRATION_STATUSES = [
  { value: 'PENDING', labelKey: 'partner.reg.pending', color: '#F59E0B' },
  { value: 'APPROVED', labelKey: 'partner.reg.approved', color: '#10B981' },
  { value: 'REJECTED', labelKey: 'partner.reg.rejected', color: '#EF4444' },
  { value: 'EXPIRED', labelKey: 'partner.reg.expired', color: '#6B7280' },
] as const

// ── Loss Reasons & Competitors ─────────────────────────────────────

export const LOSS_REASONS = [
  { value: 'PRICE', labelKey: 'lossReason.PRICE' },
  { value: 'COMPETITOR', labelKey: 'lossReason.COMPETITOR' },
  { value: 'BUDGET', labelKey: 'lossReason.BUDGET' },
  { value: 'TIMING', labelKey: 'lossReason.TIMING' },
  { value: 'COMPLIANCE', labelKey: 'lossReason.COMPLIANCE' },
  { value: 'TECHNICAL', labelKey: 'lossReason.TECHNICAL' },
  { value: 'RELATIONSHIP', labelKey: 'lossReason.RELATIONSHIP' },
  { value: 'OTHER', labelKey: 'lossReason.OTHER' },
] as const

export const COMPETITORS = [
  'DJI', 'Autel Robotics', 'Skydio', 'Parrot', 'Teledyne FLIR',
  'Shield AI', 'AeroVironment', 'L3Harris', 'Other',
] as const

// ── Countries & Regions ──────────────────────────────────────────────

export const COUNTRIES = [
  { code: 'US', name: { en: 'United States', vi: 'Hoa Kỳ' }, region: 'North America' },
  { code: 'VN', name: { en: 'Vietnam', vi: 'Việt Nam' }, region: 'Southeast Asia' },
  { code: 'IN', name: { en: 'India', vi: 'Ấn Độ' }, region: 'South Asia' },
  { code: 'AE', name: { en: 'UAE', vi: 'Các Tiểu Vương Quốc Ả Rập' }, region: 'Middle East' },
  { code: 'DE', name: { en: 'Germany', vi: 'Đức' }, region: 'Europe' },
  { code: 'GB', name: { en: 'United Kingdom', vi: 'Anh' }, region: 'Europe' },
  { code: 'JP', name: { en: 'Japan', vi: 'Nhật Bản' }, region: 'East Asia' },
  { code: 'KR', name: { en: 'South Korea', vi: 'Hàn Quốc' }, region: 'East Asia' },
  { code: 'AU', name: { en: 'Australia', vi: 'Úc' }, region: 'Oceania' },
  { code: 'SG', name: { en: 'Singapore', vi: 'Singapore' }, region: 'Southeast Asia' },
  { code: 'TH', name: { en: 'Thailand', vi: 'Thái Lan' }, region: 'Southeast Asia' },
  { code: 'PH', name: { en: 'Philippines', vi: 'Philippines' }, region: 'Southeast Asia' },
  { code: 'SA', name: { en: 'Saudi Arabia', vi: 'Ả Rập Saudi' }, region: 'Middle East' },
  { code: 'IL', name: { en: 'Israel', vi: 'Israel' }, region: 'Middle East' },
  { code: 'FR', name: { en: 'France', vi: 'Pháp' }, region: 'Europe' },
  { code: 'CA', name: { en: 'Canada', vi: 'Canada' }, region: 'North America' },
  { code: 'BR', name: { en: 'Brazil', vi: 'Brazil' }, region: 'South America' },
  { code: 'OTHER', name: { en: 'Other', vi: 'Khác' }, region: 'Other' },
] as const

export const REGIONS = [
  'North America', 'South America', 'Europe', 'Middle East',
  'South Asia', 'Southeast Asia', 'East Asia', 'Oceania', 'Africa', 'Other',
] as const

export function getCountryRegion(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.region || 'Other'
}

export function getCountryName(code: string, locale: 'en' | 'vi' = 'en'): string {
  return COUNTRIES.find((c) => c.code === code)?.name[locale] || code
}

export function formatNumber(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatShortCurrency(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return value.toString()
}
