// workforce-planning/types/workforce.types.ts

/**
 * LAC VIET HR - Workforce Planning Types
 * Headcount planning, forecasting, and organizational planning
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum PlanningCycleStatus {
  DRAFT = 'DRAFT',
  IN_PLANNING = 'IN_PLANNING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum HeadcountRequestType {
  NEW_POSITION = 'NEW_POSITION',
  REPLACEMENT = 'REPLACEMENT',
  CONVERSION = 'CONVERSION',         // Contractor to FTE
  UPGRADE = 'UPGRADE',               // Position upgrade
  TRANSFER = 'TRANSFER',
  RESTRUCTURE = 'RESTRUCTURE',
}

export enum HeadcountRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  MANAGER_APPROVED = 'MANAGER_APPROVED',
  HR_REVIEWED = 'HR_REVIEWED',
  FINANCE_APPROVED = 'FINANCE_APPROVED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
}

export enum PositionType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN',
  CONSULTANT = 'CONSULTANT',
}

export enum ForecastMethod {
  LINEAR_REGRESSION = 'LINEAR_REGRESSION',
  MOVING_AVERAGE = 'MOVING_AVERAGE',
  EXPONENTIAL_SMOOTHING = 'EXPONENTIAL_SMOOTHING',
  RATIO_ANALYSIS = 'RATIO_ANALYSIS',
  DELPHI = 'DELPHI',
  SCENARIO_BASED = 'SCENARIO_BASED',
  AI_ML = 'AI_ML',
}

export enum ScenarioType {
  BASELINE = 'BASELINE',
  OPTIMISTIC = 'OPTIMISTIC',
  PESSIMISTIC = 'PESSIMISTIC',
  AGGRESSIVE_GROWTH = 'AGGRESSIVE_GROWTH',
  COST_REDUCTION = 'COST_REDUCTION',
  CUSTOM = 'CUSTOM',
}

export enum AttritionRiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum SkillGapSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum WorkforceSegment {
  LEADERSHIP = 'LEADERSHIP',
  MANAGEMENT = 'MANAGEMENT',
  PROFESSIONAL = 'PROFESSIONAL',
  TECHNICAL = 'TECHNICAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  OPERATIONAL = 'OPERATIONAL',
  SALES = 'SALES',
  SUPPORT = 'SUPPORT',
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFORCE PLANNING CYCLE
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkforcePlanningCycle {
  id: string;
  name: string;
  description?: string;
  
  // Period
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  planningHorizonMonths: number;     // 12, 24, 36 months
  
  // Status
  status: PlanningCycleStatus;
  
  // Timeline
  planningStartDate: Date;
  planningEndDate: Date;
  reviewStartDate: Date;
  reviewEndDate: Date;
  approvalDeadline: Date;
  
  // Budget
  totalHeadcountBudget: number;
  totalCostBudget: number;
  currency: string;
  
  // Current state
  currentHeadcount: number;
  plannedHeadcount: number;
  netChange: number;
  
  // Breakdown
  departmentPlans: DepartmentWorkforcePlan[];
  
  // Scenarios
  scenarios: WorkforceScenario[];
  selectedScenarioId?: string;
  
  // Approval
  approvedBy?: string;
  approvedDate?: Date;
  approvalComments?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentWorkforcePlan {
  id: string;
  cycleId: string;
  departmentId: string;
  departmentName: string;
  
  // Current state
  currentHeadcount: number;
  currentFTE: number;
  currentLaborCost: number;
  
  // Planned
  plannedHeadcount: number;
  plannedFTE: number;
  plannedLaborCost: number;
  
  // Changes
  plannedHires: number;
  plannedAttrition: number;
  plannedTransfersIn: number;
  plannedTransfersOut: number;
  plannedPromotions: number;
  
  netChange: number;
  costChange: number;
  
  // By quarter
  quarterlyPlan: QuarterlyPlan[];
  
  // Headcount requests
  headcountRequests: HeadcountRequest[];
  
  // Justification
  justification?: string;
  businessDrivers?: string[];
  
  // Manager
  planOwnerId: string;
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  
  submittedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QuarterlyPlan {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  
  startingHeadcount: number;
  plannedHires: number;
  plannedAttrition: number;
  plannedTransfers: number;
  endingHeadcount: number;
  
  laborCost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADCOUNT REQUESTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface HeadcountRequest {
  id: string;
  requestNumber: string;
  
  cycleId?: string;
  departmentPlanId?: string;
  
  // Request type
  requestType: HeadcountRequestType;
  
  // Position details
  positionTitle: string;
  positionLevel: string;
  jobFamilyId?: string;
  gradeId?: string;
  
  positionType: PositionType;
  
  // Location
  locationId?: string;
  locationName?: string;
  isRemote: boolean;
  
  // Department
  departmentId: string;
  departmentName: string;
  reportingToId?: string;
  reportingToName?: string;
  
  // Quantity
  quantity: number;
  
  // Timeline
  targetStartDate: Date;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Cost
  estimatedSalary: number;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  totalCostEstimate: number;         // Salary + benefits + overhead
  
  // Justification
  businessJustification: string;
  impactIfNotFilled?: string;
  
  // For replacement
  replacementForEmployeeId?: string;
  replacementReason?: string;
  
  // Requirements
  requiredSkills?: string[];
  requiredExperience?: number;
  
  // Status
  status: HeadcountRequestStatus;
  
  // Approval workflow
  approvalHistory: ApprovalHistoryEntry[];
  currentApprovalLevel: number;
  
  // Requester
  requesterId: string;
  requesterName: string;
  requestDate: Date;
  
  // Linked requisition (after approval)
  requisitionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalHistoryEntry {
  level: number;
  approverRole: 'MANAGER' | 'HR' | 'FINANCE' | 'EXECUTIVE';
  approverId: string;
  approverName: string;
  
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'ESCALATE';
  comments?: string;
  
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORECASTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkforceForecast {
  id: string;
  name: string;
  description?: string;
  
  cycleId?: string;
  
  // Forecast period
  startDate: Date;
  endDate: Date;
  horizonMonths: number;
  
  // Method
  method: ForecastMethod;
  modelParameters?: Record<string, number>;
  
  // Input data
  historicalDataMonths: number;
  
  // Results
  forecastResults: ForecastPeriodResult[];
  
  // Accuracy
  confidenceLevel: number;           // 0-100%
  mape?: number;                     // Mean Absolute Percentage Error
  
  // Assumptions
  assumptions: ForecastAssumption[];
  
  generatedAt: Date;
  generatedBy: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastPeriodResult {
  period: Date;                      // Month start
  
  // Headcount
  predictedHeadcount: number;
  headcountLowerBound: number;
  headcountUpperBound: number;
  
  // By segment
  segmentBreakdown: {
    segment: WorkforceSegment;
    headcount: number;
  }[];
  
  // Movements
  predictedHires: number;
  predictedAttrition: number;
  predictedAttritionRate: number;
  
  // Cost
  predictedLaborCost: number;
  predictedCostPerEmployee: number;
}

export interface ForecastAssumption {
  category: string;
  assumption: string;
  value?: number;
  notes?: string;
}

export interface AttritionForecast {
  id: string;
  forecastId: string;
  
  // Period
  period: Date;
  
  // Overall
  predictedAttritionRate: number;
  predictedAttritionCount: number;
  
  // By type
  voluntaryAttrition: number;
  involuntaryAttrition: number;
  retirements: number;
  
  // By risk level
  byRiskLevel: {
    level: AttritionRiskLevel;
    count: number;
    percentage: number;
  }[];
  
  // By department
  byDepartment: {
    departmentId: string;
    departmentName: string;
    attritionRate: number;
    attritionCount: number;
  }[];
  
  // High-risk employees
  highRiskEmployeeIds?: string[];
  
  // Cost impact
  estimatedAttritionCost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkforceScenario {
  id: string;
  cycleId: string;
  
  name: string;
  description?: string;
  
  type: ScenarioType;
  
  // Parameters
  revenueGrowthRate: number;
  headcountGrowthRate: number;
  attritionRate: number;
  productivityFactor: number;
  
  // Custom parameters
  customParameters?: Record<string, number>;
  
  // Results
  projectedHeadcount: number;
  projectedLaborCost: number;
  projectedRevenuePerEmployee: number;
  
  // Timeline
  monthlyProjections: ScenarioMonthlyProjection[];
  
  // Impact
  headcountChange: number;
  costChange: number;
  
  // Comparison to baseline
  varianceFromBaseline?: {
    headcount: number;
    cost: number;
    productivity: number;
  };
  
  // Notes
  assumptions: string[];
  risks: string[];
  opportunities: string[];
  
  isSelected: boolean;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioMonthlyProjection {
  month: Date;
  
  headcount: number;
  hires: number;
  attrition: number;
  
  laborCost: number;
  revenuePerEmployee: number;
  
  cumulativeHires: number;
  cumulativeAttrition: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS & GAPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SkillsInventory {
  id: string;
  asOfDate: Date;
  
  // Total skills tracked
  totalSkills: number;
  totalEmployeesAssessed: number;
  
  // By category
  skillsByCategory: {
    category: string;
    skillCount: number;
    employeesWithSkill: number;
  }[];
  
  // Critical skills
  criticalSkills: SkillAnalysis[];
  
  // Emerging skills
  emergingSkills: SkillAnalysis[];
  
  // Declining skills
  decliningSkills: SkillAnalysis[];
  
  createdAt: Date;
}

export interface SkillAnalysis {
  skillId: string;
  skillName: string;
  category: string;
  
  // Current state
  employeesWithSkill: number;
  averageProficiencyLevel: number;
  
  // Demand
  currentDemand: number;             // Positions requiring this skill
  futureDemand: number;              // Projected in next 12 months
  
  // Gap
  gapCount: number;                  // Demand - Supply
  gapSeverity: SkillGapSeverity;
  
  // Trend
  supplyTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  demandTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  
  // Actions
  recommendedActions: string[];
}

export interface SkillGapAnalysis {
  id: string;
  analysisDate: Date;
  
  cycleId?: string;
  departmentId?: string;
  
  // Summary
  totalGaps: number;
  criticalGaps: number;
  
  // Gaps by skill
  skillGaps: {
    skillId: string;
    skillName: string;
    category: string;
    
    required: number;                // Positions needing this
    available: number;               // Employees with this
    gap: number;
    
    severity: SkillGapSeverity;
    
    closingStrategies: string[];     // Build, Buy, Borrow
  }[];
  
  // Gaps by department
  departmentGaps: {
    departmentId: string;
    departmentName: string;
    totalGaps: number;
    criticalGaps: number;
    topGapSkills: string[];
  }[];
  
  // Cost to close gaps
  estimatedTrainingCost: number;
  estimatedHiringCost: number;
  estimatedContractorCost: number;
  
  // Recommendations
  recommendations: GapClosingRecommendation[];
  
  createdBy: string;
  createdAt: Date;
}

export interface GapClosingRecommendation {
  skillId: string;
  skillName: string;
  
  strategy: 'BUILD' | 'BUY' | 'BORROW' | 'HYBRID';
  
  // For BUILD
  trainingPrograms?: string[];
  trainingDurationMonths?: number;
  trainingCost?: number;
  
  // For BUY
  hiresToMake?: number;
  hiringTimeline?: number;
  hiringCost?: number;
  
  // For BORROW
  contractorCount?: number;
  contractDuration?: number;
  contractCost?: number;
  
  totalCost: number;
  timeToClose: number;               // Months
  
  priority: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATIONAL DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrganizationDesign {
  id: string;
  name: string;
  description?: string;
  
  type: 'CURRENT' | 'PROPOSED' | 'WHAT_IF';
  
  // Structure
  orgUnits: OrgDesignUnit[];
  
  // Metrics
  totalHeadcount: number;
  managementLayers: number;
  averageSpanOfControl: number;
  
  // Analysis
  structureAnalysis: StructureAnalysis;
  
  // Comparison (for proposed/what-if)
  comparedToId?: string;
  changes?: OrgDesignChange[];
  
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'IMPLEMENTED';
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgDesignUnit {
  id: string;
  designId: string;
  
  name: string;
  type: 'COMPANY' | 'DIVISION' | 'DEPARTMENT' | 'TEAM' | 'UNIT';
  
  parentUnitId?: string;
  level: number;
  
  // Leader
  leaderId?: string;
  leaderTitle?: string;
  
  // Headcount
  headcount: number;
  managerCount: number;
  individualContributorCount: number;
  
  // Span of control
  spanOfControl: number;
  
  // Cost center
  costCenterId?: string;
  
  // Positions
  positions: OrgDesignPosition[];
}

export interface OrgDesignPosition {
  id: string;
  unitId: string;
  
  title: string;
  level: string;
  
  isManager: boolean;
  reportsToPositionId?: string;
  
  headcount: number;                 // Number of people in this position
  
  isFilled: boolean;
  incumbentIds?: string[];
}

export interface StructureAnalysis {
  // Span of control
  spanOfControlAnalysis: {
    average: number;
    median: number;
    min: number;
    max: number;
    distribution: { range: string; count: number }[];
    recommendations: string[];
  };
  
  // Layers
  layerAnalysis: {
    totalLayers: number;
    employeesPerLayer: { layer: number; count: number }[];
    flatnessRatio: number;           // Employees / Layers
    recommendations: string[];
  };
  
  // Ratio analysis
  ratioAnalysis: {
    managerToEmployeeRatio: number;
    hrToEmployeeRatio: number;
    supportToRevenueRatio: number;
  };
  
  // Cost analysis
  costAnalysis: {
    totalLaborCost: number;
    managementCostPercentage: number;
    overheadPercentage: number;
  };
}

export interface OrgDesignChange {
  changeType: 'ADD_UNIT' | 'REMOVE_UNIT' | 'MOVE_UNIT' | 
              'ADD_POSITION' | 'REMOVE_POSITION' | 'MOVE_POSITION' |
              'CHANGE_REPORTING' | 'MERGE' | 'SPLIT';
  
  description: string;
  
  affectedUnitId?: string;
  affectedPositionId?: string;
  
  fromParentId?: string;
  toParentId?: string;
  
  headcountImpact: number;
  costImpact: number;
  
  justification?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkforceAnalytics {
  asOfDate: Date;
  
  // Current state
  currentState: {
    totalHeadcount: number;
    totalFTE: number;
    totalLaborCost: number;
    averageTenure: number;
    averageAge: number;
    diversityMetrics: DiversityMetrics;
  };
  
  // Composition
  composition: {
    byDepartment: CompositionBreakdown[];
    byLocation: CompositionBreakdown[];
    byJobFamily: CompositionBreakdown[];
    byLevel: CompositionBreakdown[];
    byEmploymentType: CompositionBreakdown[];
    byTenure: CompositionBreakdown[];
    byAge: CompositionBreakdown[];
  };
  
  // Movement
  movement: {
    period: string;                  // 'YTD', 'Last 12 months'
    hires: number;
    terminations: number;
    voluntaryTerminations: number;
    involuntaryTerminations: number;
    retirements: number;
    internalTransfers: number;
    promotions: number;
    turnoverRate: number;
    voluntaryTurnoverRate: number;
  };
  
  // Productivity
  productivity: {
    revenuePerEmployee: number;
    profitPerEmployee: number;
    laborCostRatio: number;
  };
  
  // Trends
  trends: {
    headcountTrend: TrendDataPoint[];
    turnoverTrend: TrendDataPoint[];
    costTrend: TrendDataPoint[];
  };
  
  // Forecasts
  forecasts: {
    headcount12Months: number;
    turnover12Months: number;
    laborCost12Months: number;
  };
}

export interface CompositionBreakdown {
  category: string;
  headcount: number;
  percentage: number;
  fte: number;
  laborCost: number;
}

export interface DiversityMetrics {
  genderDistribution: { gender: string; count: number; percentage: number }[];
  ageDistribution: { range: string; count: number; percentage: number }[];
  tenureDistribution: { range: string; count: number; percentage: number }[];
}

export interface TrendDataPoint {
  date: Date;
  value: number;
}

export interface WorkforceDashboard {
  // Summary cards
  summary: {
    totalHeadcount: number;
    headcountChange: number;
    openPositions: number;
    turnoverRate: number;
    turnoverChange: number;
    timeToFill: number;
    laborCost: number;
    laborCostChange: number;
  };
  
  // Pending requests
  pendingRequests: {
    total: number;
    byStatus: { status: string; count: number }[];
    urgent: number;
  };
  
  // Plan vs actual
  planVsActual: {
    plannedHeadcount: number;
    actualHeadcount: number;
    variance: number;
    plannedHires: number;
    actualHires: number;
    hiringVariance: number;
  };
  
  // Upcoming
  upcomingEvents: {
    retirements: { count: number; employees: { id: string; name: string; date: Date }[] };
    contractExpirations: { count: number; employees: { id: string; name: string; date: Date }[] };
    probationEnds: { count: number; employees: { id: string; name: string; date: Date }[] };
  };
  
  // Alerts
  alerts: WorkforceAlert[];
}

export interface WorkforceAlert {
  type: 'HEADCOUNT' | 'TURNOVER' | 'COST' | 'SKILL_GAP' | 'COMPLIANCE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  departmentId?: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreatePlanningCycleDto {
  name: string;
  description?: string;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  planningHorizonMonths: number;
  totalHeadcountBudget: number;
  totalCostBudget: number;
  currency: string;
  timeline: {
    planningStartDate: Date;
    planningEndDate: Date;
    reviewStartDate: Date;
    reviewEndDate: Date;
    approvalDeadline: Date;
  };
}

export interface CreateHeadcountRequestDto {
  cycleId?: string;
  requestType: HeadcountRequestType;
  positionTitle: string;
  positionLevel: string;
  positionType: PositionType;
  departmentId: string;
  locationId?: string;
  isRemote: boolean;
  quantity: number;
  targetStartDate: Date;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedSalary: number;
  businessJustification: string;
  requiredSkills?: string[];
  replacementForEmployeeId?: string;
}

export interface ApproveHeadcountRequestDto {
  requestId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'ESCALATE';
  comments?: string;
}

export interface CreateScenarioDto {
  cycleId: string;
  name: string;
  description?: string;
  type: ScenarioType;
  revenueGrowthRate: number;
  headcountGrowthRate: number;
  attritionRate: number;
  productivityFactor: number;
  assumptions?: string[];
}

export interface RunForecastDto {
  cycleId?: string;
  startDate: Date;
  horizonMonths: number;
  method: ForecastMethod;
  historicalDataMonths: number;
  departmentIds?: string[];
}

export interface WorkforcePlanFilters {
  cycleId?: string;
  departmentId?: string;
  status?: string;
}

export interface HeadcountRequestFilters {
  cycleId?: string;
  departmentId?: string;
  status?: HeadcountRequestStatus;
  requestType?: HeadcountRequestType;
  urgency?: string;
  requesterId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
