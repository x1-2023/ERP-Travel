// ══════════════════════════════════════════════════════════════════════════════
//                    🚀 ADVANCED MODULE - TYPE DEFINITIONS
//                         File: types/advanced.ts
// ══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// AI ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export type InsightType = 'ANOMALY' | 'TREND' | 'OPPORTUNITY' | 'RISK';

export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';

export type RecommendationType =
  | 'PROMOTION_OPTIMIZATION'
  | 'BUDGET_ALLOCATION'
  | 'CUSTOMER_TARGETING'
  | 'TIMING_SUGGESTION';

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

// ═══════════════════════════════════════════════════════════════════════════════
// AI INSIGHT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AIInsight {
  id: string;
  type: InsightType;
  category: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  data: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  actionRequired: boolean;
  actionTaken: boolean;
  dismissedAt?: string;
  dismissedById?: string;
  expiresAt?: string;
  createdAt: string;
  createdById: string;
}

export interface InsightListParams {
  type?: InsightType;
  category?: string;
  severity?: Severity;
  actionRequired?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface InsightSummary {
  total: number;
  byType: Record<InsightType, number>;
  bySeverity: Record<Severity, number>;
  actionRequired: number;
}

export interface InsightListResponse {
  success: boolean;
  data: AIInsight[];
  pagination: Pagination;
  summary: InsightSummary;
}

export interface GenerateInsightsRequest {
  category: 'PROMOTION' | 'CLAIM' | 'SALES' | 'INVENTORY' | 'ALL';
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface TakeActionRequest {
  action: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI RECOMMENDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RecommendationImpact {
  currentROI?: number;
  potentialROI?: number;
  uplift?: number;
  unusedBudget?: number;
  potentialPromotions?: number;
  customerScore?: number;
  potentialIncrease?: number;
}

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  confidence: number;
  impact: RecommendationImpact;
  parameters: Record<string, unknown>;
  reasoning: string;
  status: RecommendationStatus;
  acceptedAt?: string;
  acceptedById?: string;
  rejectedReason?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface RecommendationListParams {
  type?: RecommendationType;
  status?: RecommendationStatus;
  entityType?: string;
  page?: number;
  pageSize?: number;
}

export interface RecommendationSummary {
  total: number;
  pending: number;
  accepted: number;
  avgConfidence: number;
}

export interface RecommendationListResponse {
  success: boolean;
  data: AIRecommendation[];
  pagination: Pagination;
  summary: RecommendationSummary;
}

export interface GenerateRecommendationsRequest {
  type: 'PROMOTION_OPTIMIZATION' | 'BUDGET_ALLOCATION' | 'CUSTOMER_TARGETING' | 'ALL';
  entityId?: string;
}

export interface RejectRecommendationRequest {
  reason: string;
}

export interface PredictRequest {
  type: 'ROI' | 'SALES' | 'REDEMPTION';
  parameters: Record<string, unknown>;
}

export interface PredictionFactor {
  name: string;
  impact: number;
}

export interface PredictResponse {
  prediction: number;
  confidence: number;
  range: { min: number; max: number };
  factors: PredictionFactor[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMAND TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VoiceCommand {
  id: string;
  userId: string;
  transcript: string;
  intent: string;
  entities: Record<string, unknown>;
  action: string;
  response: string;
  success: boolean;
  duration: number;
  createdAt: string;
}

export interface TranscribeRequest {
  audio: string;
  language?: string;
}

export interface TranscribeResponse {
  success: boolean;
  transcript: string;
  confidence: number;
}

export interface ProcessCommandRequest {
  transcript: string;
  context?: Record<string, unknown>;
}

export interface CommandAction {
  type: string;
  params: Record<string, unknown>;
}

export interface ProcessCommandResponse {
  success: boolean;
  intent: string;
  entities: Record<string, unknown>;
  action: CommandAction | null;
  response: string;
  data?: unknown;
}

export interface VoiceSuggestion {
  command: string;
  description: string;
}

export interface VoiceCommandHistoryParams {
  page?: number;
  pageSize?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BI / ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ReportType = 'TABLE' | 'CHART' | 'KPI' | 'MIXED';

export type ChartType = 'BAR' | 'LINE' | 'PIE' | 'AREA' | 'SCATTER';

export type DataSource = 'PROMOTIONS' | 'CLAIMS' | 'SALES' | 'INVENTORY' | 'CUSTOM';

export type ColumnType = 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'PERCENTAGE';

export type FilterOperator = 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'CONTAINS';

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'BOTH';

export interface ColumnConfig {
  field: string;
  header: string;
  type: ColumnType;
  format?: string;
  width?: number;
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface OrderByConfig {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface ReportConfig {
  dataSource: DataSource;
  query?: string;
  columns?: ColumnConfig[];
  filters?: FilterConfig[];
  groupBy?: string[];
  orderBy?: OrderByConfig[];
  chartType?: ChartType;
  chartConfig?: Record<string, unknown>;
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  format: ExportFormat;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ScheduleConfig;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface CreateReportRequest {
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ScheduleConfig;
}

export interface UpdateReportRequest {
  name?: string;
  description?: string;
  type?: ReportType;
  config?: ReportConfig;
  schedule?: ScheduleConfig;
}

export interface ExecuteReportParams {
  filters?: Record<string, unknown>;
  dateRange?: { from: string; to: string };
  format?: 'JSON' | 'CSV' | 'EXCEL' | 'PDF';
}

export interface ReportListParams {
  type?: ReportType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface KPI {
  name: string;
  value: number;
  change?: number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  format?: 'NUMBER' | 'CURRENCY' | 'PERCENTAGE';
  subtitle?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  data: ChartDataPoint[];
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
}

export interface DashboardParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardResponse {
  kpis: KPI[];
  charts: ChartData[];
  trends?: TrendData[];
}

export interface ExportRequest {
  type: 'PROMOTIONS' | 'CLAIMS' | 'CUSTOMERS' | 'PRODUCTS' | 'REPORT';
  reportId?: string;
  filters?: Record<string, unknown>;
  format: 'EXCEL' | 'CSV' | 'PDF';
  columns?: string[];
  dateRange?: { from: string; to: string };
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  filename?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const INSIGHT_TYPES: InsightType[] = ['ANOMALY', 'TREND', 'OPPORTUNITY', 'RISK'];

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  ANOMALY: 'Anomaly',
  TREND: 'Trend',
  OPPORTUNITY: 'Opportunity',
  RISK: 'Risk',
};

export const SEVERITIES: Severity[] = ['INFO', 'WARNING', 'CRITICAL'];

export const SEVERITY_LABELS: Record<Severity, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  INFO: 'blue',
  WARNING: 'yellow',
  CRITICAL: 'red',
};

export const RECOMMENDATION_TYPES: RecommendationType[] = [
  'PROMOTION_OPTIMIZATION',
  'BUDGET_ALLOCATION',
  'CUSTOMER_TARGETING',
  'TIMING_SUGGESTION',
];

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  PROMOTION_OPTIMIZATION: 'Promotion Optimization',
  BUDGET_ALLOCATION: 'Budget Allocation',
  CUSTOMER_TARGETING: 'Customer Targeting',
  TIMING_SUGGESTION: 'Timing Suggestion',
};

export const RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
];

export const RECOMMENDATION_STATUS_LABELS: Record<RecommendationStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export const VOICE_INTENTS = [
  'LIST_PROMOTIONS',
  'GET_PROMOTION_STATUS',
  'APPROVE_CLAIM',
  'REJECT_CLAIM',
  'SHOW_REPORT',
  'EXPIRING_PROMOTIONS',
  'CREATE_PROMOTION',
  'SHOW_DASHBOARD',
  'HELP',
] as const;

export type VoiceIntent = typeof VOICE_INTENTS[number];

export const VOICE_COMMAND_EXAMPLES: { command: string; intent: VoiceIntent }[] = [
  { command: 'Show me active promotions', intent: 'LIST_PROMOTIONS' },
  { command: "What's the status of PROMO-001?", intent: 'GET_PROMOTION_STATUS' },
  { command: 'Approve claim CLM-0042', intent: 'APPROVE_CLAIM' },
  { command: 'Show sales report for last month', intent: 'SHOW_REPORT' },
  { command: 'What promotions are expiring this week?', intent: 'EXPIRING_PROMOTIONS' },
];

export const REPORT_TYPES: ReportType[] = ['TABLE', 'CHART', 'KPI', 'MIXED'];

export const CHART_TYPES: ChartType[] = ['BAR', 'LINE', 'PIE', 'AREA', 'SCATTER'];

export const DATA_SOURCES: DataSource[] = ['PROMOTIONS', 'CLAIMS', 'SALES', 'INVENTORY', 'CUSTOM'];
