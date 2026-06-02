// ============================================================
// Multi-tenant SaaS Infrastructure
// Billing, metering, subscription, onboarding, tenant isolation
// ============================================================

import Decimal from 'decimal.js';
import { addDays, addMonths, addYears, differenceInDays, format, isAfter, isBefore } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────

export type TierName = 'basic' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'suspended' | 'expired';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type UsageMetricType = 'users' | 'storage_gb' | 'api_calls' | 'ai_tokens' | 'invoices' | 'products' | 'orders';

// ─── Pricing Plans ───────────────────────────────────────────

export interface PricingPlan {
  tier: TierName;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  pricing: {
    monthly: Decimal;
    quarterly: Decimal;     // ~10% discount
    yearly: Decimal;        // ~20% discount
  };
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  modules: string[];
}

export interface PlanFeature {
  key: string;
  name: string;
  nameVi: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  maxUsers: number;
  maxStorageGB: number;
  maxAPICallsPerMonth: number;
  maxAITokensPerMonth: number;
  maxInvoicesPerMonth: number;
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStorefronts: number;
  maxWebhooks: number;
  customDomain: boolean;
  sla: string;
  support: 'community' | 'email' | 'priority' | 'dedicated';
}

/**
 * Pricing plans — VND
 * Competitive with Vietnamese SaaS market
 */
export const PRICING_PLANS: Record<TierName, PricingPlan> = {
  basic: {
    tier: 'basic',
    name: 'Basic',
    nameVi: 'Cơ bản',
    description: 'For small businesses getting started',
    descriptionVi: 'Dành cho doanh nghiệp nhỏ mới bắt đầu',
    pricing: {
      monthly: new Decimal('990000'),      // 990K VND/month
      quarterly: new Decimal('2670000'),    // 890K/month
      yearly: new Decimal('9500000'),       // ~792K/month
    },
    currency: 'VND',
    features: [
      { key: 'hrm', name: 'Human Resources', nameVi: 'Quản lý nhân sự', included: true },
      { key: 'crm', name: 'Customer Relations', nameVi: 'Quản lý khách hàng', included: true },
      { key: 'pm', name: 'Project Management', nameVi: 'Quản lý dự án', included: true },
      { key: 'excel_ai', name: 'Excel AI', nameVi: 'Excel AI', included: true },
      { key: 'accounting', name: 'Accounting (VAS)', nameVi: 'Kế toán (VAS)', included: false },
      { key: 'mrp', name: 'Manufacturing', nameVi: 'Sản xuất', included: false },
      { key: 'ecommerce', name: 'E-commerce', nameVi: 'Thương mại điện tử', included: false },
      { key: 'ai_copilot', name: 'AI Copilot', nameVi: 'AI Copilot', included: false },
      { key: 'sdk', name: 'Developer SDK', nameVi: 'SDK nhà phát triển', included: false },
    ],
    limits: {
      maxUsers: 10,
      maxStorageGB: 5,
      maxAPICallsPerMonth: 10000,
      maxAITokensPerMonth: 100000,
      maxInvoicesPerMonth: 50,
      maxProducts: 100,
      maxOrdersPerMonth: 0,
      maxStorefronts: 0,
      maxWebhooks: 3,
      customDomain: false,
      sla: '99.5%',
      support: 'email',
    },
    modules: ['hrm', 'crm', 'pm', 'excel-ai'],
  },

  pro: {
    tier: 'pro',
    name: 'Professional',
    nameVi: 'Chuyên nghiệp',
    description: 'For growing businesses with advanced needs',
    descriptionVi: 'Dành cho doanh nghiệp đang phát triển',
    pricing: {
      monthly: new Decimal('2990000'),     // 2.99M VND/month
      quarterly: new Decimal('8070000'),    // 2.69M/month
      yearly: new Decimal('28700000'),      // ~2.39M/month
    },
    currency: 'VND',
    features: [
      { key: 'hrm', name: 'Human Resources', nameVi: 'Quản lý nhân sự', included: true },
      { key: 'crm', name: 'Customer Relations', nameVi: 'Quản lý khách hàng', included: true },
      { key: 'pm', name: 'Project Management', nameVi: 'Quản lý dự án', included: true },
      { key: 'excel_ai', name: 'Excel AI', nameVi: 'Excel AI', included: true },
      { key: 'accounting', name: 'Accounting (VAS)', nameVi: 'Kế toán VAS + Thuế', included: true },
      { key: 'mrp', name: 'Manufacturing', nameVi: 'Sản xuất', included: true },
      { key: 'otb', name: 'OTB Planning', nameVi: 'OTB Planning', included: true },
      { key: 'tpm', name: 'TPM', nameVi: 'Bảo trì thiết bị', included: true },
      { key: 'ecommerce', name: 'E-commerce', nameVi: 'Thương mại điện tử', included: false },
      { key: 'ai_copilot', name: 'AI Copilot', nameVi: 'AI Copilot', included: false },
      { key: 'sdk', name: 'Developer SDK', nameVi: 'SDK nhà phát triển', included: false },
    ],
    limits: {
      maxUsers: 50,
      maxStorageGB: 50,
      maxAPICallsPerMonth: 100000,
      maxAITokensPerMonth: 500000,
      maxInvoicesPerMonth: 500,
      maxProducts: 5000,
      maxOrdersPerMonth: 0,
      maxStorefronts: 0,
      maxWebhooks: 10,
      customDomain: false,
      sla: '99.9%',
      support: 'priority',
    },
    modules: ['hrm', 'crm', 'pm', 'excel-ai', 'accounting', 'mrp', 'otb', 'tpm'],
  },

  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    nameVi: 'Doanh nghiệp',
    description: 'For large organizations with full capabilities',
    descriptionVi: 'Dành cho doanh nghiệp lớn, đầy đủ tính năng',
    pricing: {
      monthly: new Decimal('7990000'),     // 7.99M VND/month
      quarterly: new Decimal('21570000'),   // 7.19M/month
      yearly: new Decimal('76700000'),      // ~6.39M/month
    },
    currency: 'VND',
    features: [
      { key: 'hrm', name: 'Human Resources', nameVi: 'Quản lý nhân sự', included: true },
      { key: 'crm', name: 'Customer Relations', nameVi: 'Quản lý khách hàng', included: true },
      { key: 'pm', name: 'Project Management', nameVi: 'Quản lý dự án', included: true },
      { key: 'excel_ai', name: 'Excel AI', nameVi: 'Excel AI', included: true },
      { key: 'accounting', name: 'Accounting (VAS + IFRS)', nameVi: 'Kế toán VAS + IFRS', included: true },
      { key: 'mrp', name: 'Manufacturing', nameVi: 'Sản xuất', included: true },
      { key: 'otb', name: 'OTB Planning', nameVi: 'OTB Planning', included: true },
      { key: 'tpm', name: 'TPM', nameVi: 'Bảo trì thiết bị', included: true },
      { key: 'ecommerce', name: 'E-commerce', nameVi: 'Thương mại điện tử', included: true },
      { key: 'ai_copilot', name: 'AI Copilot', nameVi: 'AI Copilot', included: true },
      { key: 'sdk', name: 'Developer SDK', nameVi: 'SDK nhà phát triển', included: true },
      { key: 'ifrs', name: 'IFRS Reporting', nameVi: 'Báo cáo IFRS', included: true },
    ],
    limits: {
      maxUsers: -1, // Unlimited
      maxStorageGB: 500,
      maxAPICallsPerMonth: 1000000,
      maxAITokensPerMonth: 5000000,
      maxInvoicesPerMonth: -1,
      maxProducts: -1,
      maxOrdersPerMonth: -1,
      maxStorefronts: 10,
      maxWebhooks: 50,
      customDomain: true,
      sla: '99.95%',
      support: 'dedicated',
    },
    modules: [
      'hrm', 'crm', 'pm', 'excel-ai', 'accounting', 'mrp', 'otb', 'tpm',
      'ecommerce', 'ai-copilot', 'sdk', 'ifrs', 'admin',
    ],
  },
};

// ─── Subscription Management ─────────────────────────────────

export interface Subscription {
  id: string;
  tenantId: string;
  tier: TierName;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amount: Decimal;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInvoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: Decimal;
  taxAmount: Decimal;
  total: Decimal;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: Decimal;
  amount: Decimal;
}

/**
 * Create a new subscription for a tenant
 */
export function createSubscription(
  tenantId: string,
  tier: TierName,
  billingCycle: BillingCycle,
  options: {
    trialDays?: number;
    startDate?: Date;
    couponDiscount?: Decimal;
  } = {}
): Subscription {
  const plan = PRICING_PLANS[tier];
  const startDate = options.startDate || new Date();
  const amount = getPlanPrice(tier, billingCycle);
  const periodEnd = calculatePeriodEnd(startDate, billingCycle);

  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    tenantId,
    tier,
    billingCycle,
    status: options.trialDays ? 'trialing' : 'active',
    amount: options.couponDiscount ? amount.sub(options.couponDiscount) : amount,
    currency: plan.currency,
    currentPeriodStart: startDate,
    currentPeriodEnd: periodEnd,
    trialEnd: options.trialDays ? addDays(startDate, options.trialDays) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return subscription;
}

/**
 * Upgrade or downgrade subscription tier
 */
export function changeTier(
  subscription: Subscription,
  newTier: TierName,
  prorate: boolean = true
): {
  subscription: Subscription;
  proratedCredit?: Decimal;
  proratedCharge?: Decimal;
  effectiveDate: Date;
} {
  const now = new Date();
  let proratedCredit: Decimal | undefined;
  let proratedCharge: Decimal | undefined;

  if (prorate) {
    const totalDays = differenceInDays(subscription.currentPeriodEnd, subscription.currentPeriodStart);
    const remainingDays = differenceInDays(subscription.currentPeriodEnd, now);

    if (totalDays > 0 && remainingDays > 0) {
      const dailyRate = subscription.amount.div(totalDays);
      proratedCredit = dailyRate.mul(remainingDays).toDecimalPlaces(0);

      const newAmount = getPlanPrice(newTier, subscription.billingCycle);
      const newDailyRate = newAmount.div(totalDays);
      proratedCharge = newDailyRate.mul(remainingDays).toDecimalPlaces(0);
    }
  }

  const updatedSubscription: Subscription = {
    ...subscription,
    tier: newTier,
    amount: getPlanPrice(newTier, subscription.billingCycle),
    updatedAt: new Date(),
  };

  return {
    subscription: updatedSubscription,
    proratedCredit,
    proratedCharge,
    effectiveDate: now,
  };
}

/**
 * Cancel subscription
 */
export function cancelSubscription(
  subscription: Subscription,
  reason: string,
  immediate: boolean = false
): Subscription {
  return {
    ...subscription,
    status: immediate ? 'cancelled' : subscription.status,
    cancelledAt: new Date(),
    cancelReason: reason,
    // If not immediate, access continues until period end
    currentPeriodEnd: immediate ? new Date() : subscription.currentPeriodEnd,
    updatedAt: new Date(),
  };
}

/**
 * Renew subscription for next period
 */
export function renewSubscription(subscription: Subscription): {
  subscription: Subscription;
  invoice: SubscriptionInvoice;
} {
  const newPeriodStart = subscription.currentPeriodEnd;
  const newPeriodEnd = calculatePeriodEnd(newPeriodStart, subscription.billingCycle);

  const renewed: Subscription = {
    ...subscription,
    status: 'active',
    currentPeriodStart: newPeriodStart,
    currentPeriodEnd: newPeriodEnd,
    updatedAt: new Date(),
  };

  const vatRate = new Decimal('0.10'); // 10% VAT
  const taxAmount = subscription.amount.mul(vatRate).toDecimalPlaces(0);

  const invoice: SubscriptionInvoice = {
    id: `inv_${Date.now()}`,
    tenantId: subscription.tenantId,
    subscriptionId: subscription.id,
    invoiceNumber: generateInvoiceNumber(),
    status: 'open',
    amount: subscription.amount,
    taxAmount,
    total: subscription.amount.add(taxAmount),
    currency: subscription.currency,
    periodStart: newPeriodStart,
    periodEnd: newPeriodEnd,
    dueDate: addDays(newPeriodStart, 7),
    items: [
      {
        description: `${PRICING_PLANS[subscription.tier].nameVi} — ${formatBillingCycle(subscription.billingCycle)}`,
        quantity: 1,
        unitPrice: subscription.amount,
        amount: subscription.amount,
      },
    ],
    createdAt: new Date(),
  };

  return { subscription: renewed, invoice };
}

// ─── Usage Metering ──────────────────────────────────────────

export interface UsageRecord {
  tenantId: string;
  metric: UsageMetricType;
  value: number;
  timestamp: Date;
}

export interface UsageSummary {
  tenantId: string;
  period: string;
  metrics: Record<UsageMetricType, {
    current: number;
    limit: number;
    percentage: number;
    exceeded: boolean;
  }>;
  alerts: UsageAlert[];
}

export interface UsageAlert {
  metric: UsageMetricType;
  level: 'warning' | 'critical' | 'exceeded';
  message: string;
  messageVi: string;
  percentage: number;
}

/**
 * Check tenant usage against plan limits
 */
export function checkUsageLimits(
  tenantId: string,
  tier: TierName,
  currentUsage: Partial<Record<UsageMetricType, number>>
): UsageSummary {
  const plan = PRICING_PLANS[tier];
  const limits = plan.limits;
  const period = format(new Date(), 'yyyy-MM');

  const metricLimits: Record<UsageMetricType, number> = {
    users: limits.maxUsers,
    storage_gb: limits.maxStorageGB,
    api_calls: limits.maxAPICallsPerMonth,
    ai_tokens: limits.maxAITokensPerMonth,
    invoices: limits.maxInvoicesPerMonth,
    products: limits.maxProducts,
    orders: limits.maxOrdersPerMonth,
  };

  const metrics: UsageSummary['metrics'] = {} as any;
  const alerts: UsageAlert[] = [];

  for (const [metric, limit] of Object.entries(metricLimits)) {
    const current = currentUsage[metric as UsageMetricType] || 0;
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : (limit > 0 ? (current / limit) * 100 : 0);
    const exceeded = !isUnlimited && limit > 0 && current > limit;

    metrics[metric as UsageMetricType] = {
      current,
      limit: isUnlimited ? -1 : limit,
      percentage: Math.round(percentage * 10) / 10,
      exceeded,
    };

    // Generate alerts
    if (!isUnlimited && limit > 0) {
      if (exceeded) {
        alerts.push({
          metric: metric as UsageMetricType,
          level: 'exceeded',
          message: `${metric} usage exceeded: ${current}/${limit}`,
          messageVi: `Đã vượt giới hạn ${getMetricNameVi(metric as UsageMetricType)}: ${current}/${limit}`,
          percentage,
        });
      } else if (percentage >= 90) {
        alerts.push({
          metric: metric as UsageMetricType,
          level: 'critical',
          message: `${metric} usage at ${percentage.toFixed(0)}%: ${current}/${limit}`,
          messageVi: `${getMetricNameVi(metric as UsageMetricType)} đạt ${percentage.toFixed(0)}%: ${current}/${limit}`,
          percentage,
        });
      } else if (percentage >= 75) {
        alerts.push({
          metric: metric as UsageMetricType,
          level: 'warning',
          message: `${metric} usage at ${percentage.toFixed(0)}%: ${current}/${limit}`,
          messageVi: `${getMetricNameVi(metric as UsageMetricType)} đạt ${percentage.toFixed(0)}%: ${current}/${limit}`,
          percentage,
        });
      }
    }
  }

  return { tenantId, period, metrics, alerts };
}

/**
 * Check if a specific action is within limits
 */
export function canPerformAction(
  tier: TierName,
  metric: UsageMetricType,
  currentValue: number,
  increment: number = 1
): { allowed: boolean; reason?: string; reasonVi?: string; suggestedTier?: TierName } {
  const plan = PRICING_PLANS[tier];
  const limits = plan.limits;

  const limitMap: Record<UsageMetricType, number> = {
    users: limits.maxUsers,
    storage_gb: limits.maxStorageGB,
    api_calls: limits.maxAPICallsPerMonth,
    ai_tokens: limits.maxAITokensPerMonth,
    invoices: limits.maxInvoicesPerMonth,
    products: limits.maxProducts,
    orders: limits.maxOrdersPerMonth,
  };

  const limit = limitMap[metric];
  if (limit === -1) return { allowed: true }; // Unlimited

  if (currentValue + increment > limit) {
    // Find suggested upgrade tier
    const tiers: TierName[] = ['basic', 'pro', 'enterprise'];
    const currentIndex = tiers.indexOf(tier);
    const suggestedTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : undefined;

    return {
      allowed: false,
      reason: `${getMetricNameVi(metric)} limit reached (${limit}). Please upgrade.`,
      reasonVi: `Đã đạt giới hạn ${getMetricNameVi(metric)} (${limit}). Vui lòng nâng cấp gói.`,
      suggestedTier,
    };
  }

  return { allowed: true };
}

// ─── Tenant Onboarding ───────────────────────────────────────

export interface OnboardingStep {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  required: boolean;
  completed: boolean;
  order: number;
}

export interface OnboardingProgress {
  tenantId: string;
  steps: OnboardingStep[];
  completedCount: number;
  totalRequired: number;
  percentComplete: number;
  isComplete: boolean;
  nextStep?: OnboardingStep;
}

/**
 * Generate onboarding checklist based on tier
 */
export function generateOnboardingSteps(tier: TierName): OnboardingStep[] {
  const steps: OnboardingStep[] = [
    {
      id: 'company_info',
      name: 'Company Information',
      nameVi: 'Thông tin công ty',
      description: 'Set up company name, tax code, address',
      descriptionVi: 'Thiết lập tên công ty, mã số thuế, địa chỉ',
      required: true,
      completed: false,
      order: 1,
    },
    {
      id: 'admin_user',
      name: 'Admin User',
      nameVi: 'Tài khoản quản trị',
      description: 'Create admin account and set password',
      descriptionVi: 'Tạo tài khoản quản trị và đặt mật khẩu',
      required: true,
      completed: false,
      order: 2,
    },
    {
      id: 'invite_team',
      name: 'Invite Team',
      nameVi: 'Mời nhân viên',
      description: 'Invite team members and assign roles',
      descriptionVi: 'Mời nhân viên và phân quyền',
      required: false,
      completed: false,
      order: 3,
    },
    {
      id: 'master_data',
      name: 'Master Data',
      nameVi: 'Dữ liệu chủ',
      description: 'Import customers, products, employees',
      descriptionVi: 'Import danh sách khách hàng, sản phẩm, nhân viên',
      required: false,
      completed: false,
      order: 4,
    },
  ];

  // Tier-specific steps
  const plan = PRICING_PLANS[tier];
  const modules = plan.modules;

  if (modules.includes('accounting')) {
    steps.push({
      id: 'chart_of_accounts',
      name: 'Chart of Accounts',
      nameVi: 'Hệ thống tài khoản',
      description: 'Set up VAS chart of accounts and fiscal year',
      descriptionVi: 'Thiết lập hệ thống tài khoản theo TT200 và năm tài chính',
      required: false,
      completed: false,
      order: 5,
    });
  }

  if (modules.includes('ecommerce')) {
    steps.push({
      id: 'storefront_setup',
      name: 'Storefront Setup',
      nameVi: 'Thiết lập cửa hàng',
      description: 'Configure online store, payment methods, shipping',
      descriptionVi: 'Cấu hình cửa hàng trực tuyến, thanh toán, vận chuyển',
      required: false,
      completed: false,
      order: 6,
    });
  }

  steps.push({
    id: 'go_live',
    name: 'Go Live',
    nameVi: 'Bắt đầu sử dụng',
    description: 'Review settings and start using the system',
    descriptionVi: 'Kiểm tra cài đặt và bắt đầu sử dụng hệ thống',
    required: true,
    completed: false,
    order: 99,
  });

  return steps.sort((a, b) => a.order - b.order);
}

/**
 * Calculate onboarding progress
 */
export function calculateOnboardingProgress(
  tenantId: string,
  steps: OnboardingStep[]
): OnboardingProgress {
  const requiredSteps = steps.filter(s => s.required);
  const completedRequired = requiredSteps.filter(s => s.completed);
  const completedCount = steps.filter(s => s.completed).length;
  const percentComplete = steps.length > 0
    ? Math.round((completedCount / steps.length) * 100)
    : 0;

  const nextStep = steps.find(s => !s.completed);

  return {
    tenantId,
    steps,
    completedCount,
    totalRequired: requiredSteps.length,
    percentComplete,
    isComplete: completedRequired.length === requiredSteps.length,
    nextStep,
  };
}

// ─── Tenant Provisioning ─────────────────────────────────────

export interface TenantProvisionRequest {
  companyName: string;
  companyNameEn?: string;
  taxCode?: string;        // Mã số thuế
  address?: string;
  adminEmail: string;
  adminName: string;
  adminPhone?: string;
  tier: TierName;
  billingCycle: BillingCycle;
  trialDays?: number;
  locale?: string;
  timezone?: string;
}

export interface TenantProvisionResult {
  tenantId: string;
  subscription: Subscription;
  onboarding: OnboardingProgress;
  credentials: {
    adminEmail: string;
    temporaryPassword: string;
    loginUrl: string;
  };
  message: string;
  messageVi: string;
}

/**
 * Provision a new tenant
 */
export function provisionTenant(request: TenantProvisionRequest): TenantProvisionResult {
  const tenantId = `tenant_${Date.now()}`;

  // Create subscription
  const subscription = createSubscription(
    tenantId,
    request.tier,
    request.billingCycle,
    { trialDays: request.trialDays ?? 14 }
  );

  // Generate onboarding steps
  const steps = generateOnboardingSteps(request.tier);
  // Auto-complete admin_user step
  const adminStep = steps.find(s => s.id === 'admin_user');
  if (adminStep) adminStep.completed = true;
  // Auto-complete company_info if tax code provided
  if (request.taxCode) {
    const companyStep = steps.find(s => s.id === 'company_info');
    if (companyStep) companyStep.completed = true;
  }

  const onboarding = calculateOnboardingProgress(tenantId, steps);

  const temporaryPassword = generateTemporaryPassword();

  return {
    tenantId,
    subscription,
    onboarding,
    credentials: {
      adminEmail: request.adminEmail,
      temporaryPassword,
      loginUrl: `https://app.erp.vn/login?tenant=${tenantId}`,
    },
    message: `Tenant ${request.companyName} created successfully. ${request.trialDays || 14}-day trial started.`,
    messageVi: `Đã tạo workspace cho ${request.companyName}. Dùng thử ${request.trialDays || 14} ngày bắt đầu.`,
  };
}

// ─── Billing Reports ─────────────────────────────────────────

export interface MRRReport {
  period: string;
  totalMRR: Decimal;
  newMRR: Decimal;
  expansionMRR: Decimal;
  contractionMRR: Decimal;
  churnMRR: Decimal;
  netNewMRR: Decimal;
  tenantCount: number;
  arpu: Decimal;             // Average Revenue Per User/Tenant
  breakdown: Record<TierName, { count: number; mrr: Decimal }>;
}

/**
 * Calculate Monthly Recurring Revenue
 */
export function calculateMRR(
  subscriptions: Array<{
    tier: TierName;
    billingCycle: BillingCycle;
    amount: string;
    status: SubscriptionStatus;
  }>
): { totalMRR: Decimal; breakdown: Record<TierName, { count: number; mrr: Decimal }> } {
  const breakdown: Record<TierName, { count: number; mrr: Decimal }> = {
    basic: { count: 0, mrr: new Decimal(0) },
    pro: { count: 0, mrr: new Decimal(0) },
    enterprise: { count: 0, mrr: new Decimal(0) },
  };

  let totalMRR = new Decimal(0);

  for (const sub of subscriptions) {
    if (!['active', 'trialing'].includes(sub.status)) continue;

    // Normalize to monthly
    const amount = new Decimal(sub.amount);
    let monthly: Decimal;

    switch (sub.billingCycle) {
      case 'monthly': monthly = amount; break;
      case 'quarterly': monthly = amount.div(3); break;
      case 'yearly': monthly = amount.div(12); break;
      default: monthly = amount;
    }

    totalMRR = totalMRR.add(monthly);
    breakdown[sub.tier].count++;
    breakdown[sub.tier].mrr = breakdown[sub.tier].mrr.add(monthly);
  }

  return { totalMRR, breakdown };
}

// ─── Helpers ─────────────────────────────────────────────────

function getPlanPrice(tier: TierName, cycle: BillingCycle): Decimal {
  return PRICING_PLANS[tier].pricing[cycle];
}

function calculatePeriodEnd(start: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case 'monthly': return addMonths(start, 1);
    case 'quarterly': return addMonths(start, 3);
    case 'yearly': return addYears(start, 1);
  }
}

function formatBillingCycle(cycle: BillingCycle): string {
  switch (cycle) {
    case 'monthly': return 'Hàng tháng';
    case 'quarterly': return 'Hàng quý';
    case 'yearly': return 'Hàng năm';
  }
}

function getMetricNameVi(metric: UsageMetricType): string {
  const names: Record<UsageMetricType, string> = {
    users: 'Người dùng',
    storage_gb: 'Dung lượng (GB)',
    api_calls: 'Lượt gọi API',
    ai_tokens: 'AI tokens',
    invoices: 'Hóa đơn',
    products: 'Sản phẩm',
    orders: 'Đơn hàng',
  };
  return names[metric] || metric;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 999999);
  return `INV-${year}-${String(seq).padStart(6, '0')}`;
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ─── Exports ─────────────────────────────────────────────────

export {
  getPlanPrice,
  calculatePeriodEnd,
  formatBillingCycle,
  getMetricNameVi,
};
