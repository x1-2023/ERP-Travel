// ══════════════════════════════════════════════════════════════════════════════
//                    📋 PLANNING MODULE - TYPE DEFINITIONS
//                         File: types/planning.ts
// ══════════════════════════════════════════════════════════════════════════════

import type { PromotionType, Promotion, User, Baseline } from '@vierp/tpm-shared';

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum ScenarioStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ClashType {
  DATE_OVERLAP = 'DATE_OVERLAP',
  CUSTOMER_OVERLAP = 'CUSTOMER_OVERLAP',
  PRODUCT_OVERLAP = 'PRODUCT_OVERLAP',
  BUDGET_CONFLICT = 'BUDGET_CONFLICT',
  MECHANIC_CONFLICT = 'MECHANIC_CONFLICT',
}

export enum ClashSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PromotionTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  category?: string;
  defaultDuration?: number;
  defaultBudget?: number;
  mechanics?: TemplateMechanics;
  eligibility?: TemplateEligibility;
  isActive: boolean;
  usageCount: number;
  versions?: TemplateVersion[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: User;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  changes?: any;
  snapshot: any;
  createdAt: Date;
  createdById: string;
}

export interface TemplateMechanics {
  discountType?: 'PERCENTAGE' | 'FIXED' | 'BOGO';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  stackable?: boolean;
  conditions?: MechanicCondition[];
}

export interface MechanicCondition {
  type: 'MIN_QTY' | 'MIN_VALUE' | 'PRODUCT_COMBO' | 'TIME_LIMIT';
  value: any;
}

export interface TemplateEligibility {
  customerTypes?: string[];
  regions?: string[];
  productCategories?: string[];
  minOrderValue?: number;
  excludedProducts?: string[];
}

export interface TemplateListParams {
  type?: PromotionType;
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTemplateRequest {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  category?: string;
  defaultDuration?: number;
  defaultBudget?: number;
  mechanics?: TemplateMechanics;
  eligibility?: TemplateEligibility;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  defaultDuration?: number;
  defaultBudget?: number;
  mechanics?: TemplateMechanics;
  eligibility?: TemplateEligibility;
  isActive?: boolean;
}

export interface ApplyTemplateRequest {
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;
  customerId?: string;
  fundId?: string;
  overrides?: Partial<TemplateMechanics>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  baselineId?: string;
  baseline?: Baseline;
  status: ScenarioStatus;
  parameters: ScenarioParameters;
  assumptions?: ScenarioAssumptions;
  results?: ScenarioResults;
  comparison?: any;
  versions?: ScenarioVersion[];
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: User;
}

export interface ScenarioVersion {
  id: string;
  scenarioId: string;
  version: number;
  parameters: ScenarioParameters;
  results?: ScenarioResults;
  notes?: string;
  createdAt: Date;
  createdById: string;
}

export interface ScenarioParameters {
  promotionType: PromotionType;
  discountPercent?: number;
  budget: number;
  duration: number;
  targetCustomers: string[];
  targetProducts: string[];
  startDate: string;
  expectedLiftPercent: number;
  redemptionRatePercent: number;
}

export interface ScenarioAssumptions {
  baselineSalesPerDay: number;
  averageOrderValue: number;
  marginPercent: number;
  cannibalizedPercent?: number;
  haloEffectPercent?: number;
}

export interface ScenarioResults {
  // Sales Impact
  baselineSales: number;
  projectedSales: number;
  incrementalSales: number;
  salesLiftPercent: number;
  
  // Cost Analysis
  promotionCost: number;
  fundingRequired: number;
  costPerIncrementalUnit: number;
  
  // Profitability
  grossMargin: number;
  netMargin: number;
  roi: number;
  paybackDays: number;
  
  // Volume
  projectedUnits: number;
  incrementalUnits: number;
  redemptions: number;
  
  // Timeline
  dailyProjections: DailyProjection[];
}

export interface DailyProjection {
  date: string;
  baselineSales: number;
  projectedSales: number;
  promotionCost: number;
  cumulativeROI: number;
}

export interface ScenarioListParams {
  status?: ScenarioStatus;
  baselineId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateScenarioRequest {
  name: string;
  description?: string;
  baselineId?: string;
  parameters: ScenarioParameters;
  assumptions?: ScenarioAssumptions;
}

export interface CompareRequest {
  scenarioIds: string[];
}

export interface CompareResponse {
  scenarios: Scenario[];
  comparison: ComparisonMatrix;
  recommendation: string;
}

export interface ComparisonMatrix {
  metrics: string[];
  values: Record<string, Record<string, number>>;
  winner: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASH DETECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ClashDetection {
  id: string;
  promotionId: string;
  promotion?: Promotion;
  clashWithId: string;
  clashWith?: Promotion;
  clashType: ClashType;
  severity: ClashSeverity;
  description?: string;
  impact?: number;
  resolution?: string;
  resolvedAt?: Date;
  resolvedById?: string;
  createdAt: Date;
}

export interface ClashListParams {
  severity?: ClashSeverity;
  promotionId?: string;
  resolved?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CheckClashRequest {
  promotionId?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

export interface CheckClashResponse {
  clashes: ClashDetection[];
  summary: ClashSummary;
}

export interface ClashSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ResolveClashRequest {
  resolution: string;
  action?: 'ADJUST_PROMOTION' | 'ADJUST_CLASH_WITH' | 'ACCEPT_RISK';
  changes?: any;
}

export interface ResolutionSuggestion {
  action: 'ADJUST_DATES' | 'CHANGE_CUSTOMER' | 'REMOVE_PRODUCTS' | 'MAKE_STACKABLE';
  description: string;
  impact: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const SCENARIO_STATUS_LABELS: Record<ScenarioStatus, string> = {
  [ScenarioStatus.DRAFT]: 'Draft',
  [ScenarioStatus.RUNNING]: 'Running',
  [ScenarioStatus.COMPLETED]: 'Completed',
  [ScenarioStatus.ARCHIVED]: 'Archived',
};

export const CLASH_TYPE_LABELS: Record<ClashType, string> = {
  [ClashType.DATE_OVERLAP]: 'Date Overlap',
  [ClashType.CUSTOMER_OVERLAP]: 'Customer Overlap',
  [ClashType.PRODUCT_OVERLAP]: 'Product Overlap',
  [ClashType.BUDGET_CONFLICT]: 'Budget Conflict',
  [ClashType.MECHANIC_CONFLICT]: 'Mechanic Conflict',
};

export const CLASH_SEVERITY_LABELS: Record<ClashSeverity, string> = {
  [ClashSeverity.LOW]: 'Low',
  [ClashSeverity.MEDIUM]: 'Medium',
  [ClashSeverity.HIGH]: 'High',
  [ClashSeverity.CRITICAL]: 'Critical',
};

export const CLASH_SEVERITY_COLORS: Record<ClashSeverity, string> = {
  [ClashSeverity.LOW]: 'blue',
  [ClashSeverity.MEDIUM]: 'yellow',
  [ClashSeverity.HIGH]: 'orange',
  [ClashSeverity.CRITICAL]: 'red',
};

export const METRICS_LABELS: Record<string, string> = {
  roi: 'ROI',
  netMargin: 'Net Margin',
  salesLiftPercent: 'Sales Lift',
  paybackDays: 'Payback Days',
  incrementalSales: 'Incremental Sales',
  promotionCost: 'Promotion Cost',
};
