// compensation-planning/types/compensation.types.ts

/**
 * LAC VIET HR - Compensation Planning Types
 * Enterprise-grade compensation management system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum CompensationCycleStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  REVIEW = 'REVIEW',
  APPROVAL = 'APPROVAL',
  APPROVED = 'APPROVED',
  IMPLEMENTED = 'IMPLEMENTED',
  CLOSED = 'CLOSED',
}

export enum SalaryStructureType {
  GRADE_BASED = 'GRADE_BASED',         // Traditional grade/step
  MARKET_BASED = 'MARKET_BASED',       // Market pricing
  BROADBAND = 'BROADBAND',             // Broad salary bands
  HYBRID = 'HYBRID',                   // Combination
}

export enum AdjustmentType {
  MERIT_INCREASE = 'MERIT_INCREASE',
  PROMOTION = 'PROMOTION',
  MARKET_ADJUSTMENT = 'MARKET_ADJUSTMENT',
  EQUITY_ADJUSTMENT = 'EQUITY_ADJUSTMENT',
  COST_OF_LIVING = 'COST_OF_LIVING',
  ONE_TIME_BONUS = 'ONE_TIME_BONUS',
  ANNUAL_BONUS = 'ANNUAL_BONUS',
  RETENTION_BONUS = 'RETENTION_BONUS',
  SIGN_ON_BONUS = 'SIGN_ON_BONUS',
  SPOT_BONUS = 'SPOT_BONUS',
  STOCK_GRANT = 'STOCK_GRANT',
  STOCK_OPTION = 'STOCK_OPTION',
}

export enum BudgetDistributionMethod {
  EQUAL = 'EQUAL',                     // Equal % to all
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
  COMPA_RATIO_INVERSE = 'COMPA_RATIO_INVERSE',
  MANAGER_DISCRETION = 'MANAGER_DISCRETION',
  HYBRID = 'HYBRID',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISION_REQUIRED = 'REVISION_REQUIRED',
}

export enum CompaRatioCategory {
  BELOW_RANGE = 'BELOW_RANGE',         // < 80%
  LOWER_QUARTILE = 'LOWER_QUARTILE',   // 80-90%
  MID_RANGE = 'MID_RANGE',             // 90-110%
  UPPER_QUARTILE = 'UPPER_QUARTILE',   // 110-120%
  ABOVE_RANGE = 'ABOVE_RANGE',         // > 120%
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALARY STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SalaryGrade {
  id: string;
  code: string;
  name: string;
  level: number;
  description?: string;
  
  // Salary range
  minimumSalary: number;
  midpointSalary: number;
  maximumSalary: number;
  currency: string;
  
  // Range spread
  rangeSpread: number;           // ((max - min) / min) * 100
  rangePenetration: number;      // Position in range
  
  // Job families
  jobFamilyIds: string[];
  
  // Market data
  marketP25?: number;
  marketP50?: number;
  marketP75?: number;
  marketP90?: number;
  marketDataSource?: string;
  marketDataDate?: Date;
  
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryBand {
  id: string;
  gradeId: string;
  grade: SalaryGrade;
  
  stepNumber?: number;           // For step-based systems
  stepName?: string;
  
  minimumSalary: number;
  targetSalary: number;
  maximumSalary: number;
  
  yearsInBandMin?: number;
  yearsInBandMax?: number;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFamily {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentFamilyId?: string;
  parentFamily?: JobFamily;
  childFamilies?: JobFamily[];
  
  // Linked grades
  salaryGrades: SalaryGrade[];
  
  // Benchmark data
  marketSurveyId?: string;
  benchmarkJobTitle?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPENSATION CYCLE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationCycle {
  id: string;
  name: string;
  description?: string;
  
  // Cycle period
  fiscalYear: number;
  cycleType: 'ANNUAL' | 'MID_YEAR' | 'QUARTERLY' | 'AD_HOC';
  startDate: Date;
  endDate: Date;
  effectiveDate: Date;          // When changes take effect
  
  status: CompensationCycleStatus;
  
  // Budget
  totalBudget: number;
  currency: string;
  budgetPoolAllocations: BudgetPoolAllocation[];
  
  // Eligibility
  eligibilityCriteria: EligibilityCriteria;
  
  // Guidelines
  meritMatrix?: MeritMatrix;
  adjustmentGuidelines: AdjustmentGuideline[];
  
  // Participants
  participantCount: number;
  eligibleEmployeeIds: string[];
  excludedEmployeeIds: string[];
  
  // Timeline
  planningStartDate: Date;
  planningEndDate: Date;
  managerReviewStartDate: Date;
  managerReviewEndDate: Date;
  approvalStartDate: Date;
  approvalEndDate: Date;
  
  // Workflow
  approvalWorkflowId?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetPoolAllocation {
  id: string;
  cycleId: string;
  
  // Allocation target
  departmentId?: string;
  divisionId?: string;
  jobFamilyId?: string;
  locationId?: string;
  
  // Budget details
  allocatedBudget: number;
  usedBudget: number;
  remainingBudget: number;
  
  // Distribution
  distributionMethod: BudgetDistributionMethod;
  meritPoolPercentage: number;
  promotionPoolPercentage: number;
  adjustmentPoolPercentage: number;
  bonusPoolPercentage: number;
  
  // Manager
  budgetOwnerId: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityCriteria {
  minTenureMonths: number;
  maxTenureMonths?: number;
  hireDateBefore?: Date;
  hireDateAfter?: Date;
  
  employmentTypes: string[];      // FULL_TIME, PART_TIME, etc.
  employmentStatuses: string[];   // ACTIVE, PROBATION, etc.
  
  excludedDepartmentIds: string[];
  excludedPositionIds: string[];
  excludedEmployeeIds: string[];
  
  minPerformanceRating?: number;
  maxPerformanceRating?: number;
  
  customCriteria?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MERIT MATRIX
// ═══════════════════════════════════════════════════════════════════════════════

export interface MeritMatrix {
  id: string;
  cycleId: string;
  name: string;
  description?: string;
  
  // Axes
  performanceRatings: string[];   // ['1', '2', '3', '4', '5']
  compaRatioRanges: CompaRatioRange[];
  
  // Matrix cells
  cells: MeritMatrixCell[];
  
  // Defaults
  defaultIncreasePercentage: number;
  maxIncreasePercentage: number;
  minIncreasePercentage: number;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompaRatioRange {
  id: string;
  label: string;
  minCompaRatio: number;
  maxCompaRatio: number;
  category: CompaRatioCategory;
}

export interface MeritMatrixCell {
  id: string;
  matrixId: string;
  
  performanceRating: string;
  compaRatioRangeId: string;
  
  // Recommended increase
  targetIncreasePercentage: number;
  minIncreasePercentage: number;
  maxIncreasePercentage: number;
  
  // Lump sum alternative
  lumpSumPercentage?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPENSATION ADJUSTMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationAdjustment {
  id: string;
  cycleId: string;
  employeeId: string;
  
  // Current compensation
  currentBaseSalary: number;
  currentTotalCash: number;
  currentCompaRatio: number;
  currentSalaryGradeId: string;
  
  // Proposed changes
  adjustmentType: AdjustmentType;
  proposedBaseSalary?: number;
  proposedIncreaseAmount?: number;
  proposedIncreasePercentage?: number;
  
  // For promotions
  proposedSalaryGradeId?: string;
  proposedPositionId?: string;
  proposedJobTitle?: string;
  
  // For bonuses
  bonusAmount?: number;
  bonusType?: string;
  bonusReason?: string;
  
  // For equity
  stockUnits?: number;
  stockOptions?: number;
  vestingScheduleId?: string;
  
  // Calculations
  newBaseSalary: number;
  newTotalCash: number;
  newCompaRatio: number;
  
  totalAdjustmentCost: number;
  
  // Justification
  justification?: string;
  performanceRating?: string;
  performanceNotes?: string;
  
  // Matrix recommendation
  matrixRecommendedPercentage?: number;
  matrixVariancePercentage?: number;
  matrixVarianceReason?: string;
  
  // Approval
  status: ApprovalStatus;
  approvalHistory: ApprovalHistoryEntry[];
  
  // Effective date
  effectiveDate: Date;
  
  // Proposer
  proposedBy: string;
  proposedAt: Date;
  
  // Manager
  managerId: string;
  managerApprovalStatus?: ApprovalStatus;
  managerApprovalDate?: Date;
  managerComments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalHistoryEntry {
  id: string;
  adjustmentId: string;
  
  approverId: string;
  approverName: string;
  approverRole: string;
  
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'MODIFIED';
  previousStatus: ApprovalStatus;
  newStatus: ApprovalStatus;
  
  comments?: string;
  
  timestamp: Date;
}

export interface AdjustmentGuideline {
  id: string;
  cycleId: string;
  
  adjustmentType: AdjustmentType;
  
  // Limits
  minPercentage?: number;
  maxPercentage?: number;
  targetPercentage?: number;
  
  minAmount?: number;
  maxAmount?: number;
  
  // Eligibility
  eligibleGradeIds?: string[];
  eligibleDepartmentIds?: string[];
  eligiblePerformanceRatings?: string[];
  
  // Approval requirements
  requiresApprovalAbovePercentage?: number;
  requiresApprovalAboveAmount?: number;
  approvalLevels: number;
  
  notes?: string;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOTAL REWARDS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TotalRewardsStatement {
  id: string;
  employeeId: string;
  statementYear: number;
  generatedAt: Date;
  
  // Base compensation
  baseSalary: number;
  
  // Variable pay
  targetBonus: number;
  actualBonus: number;
  commissions?: number;
  
  // Equity
  stockValue: number;
  unvestedStockValue: number;
  stockOptionsValue: number;
  
  // Benefits
  healthInsuranceValue: number;
  lifeInsuranceValue: number;
  retirementContribution: number;     // Company contribution
  ptoValue: number;                   // Calculated value of PTO
  otherBenefitsValue: number;
  
  // Perks
  perksValue: number;                 // Car allowance, phone, etc.
  
  // Totals
  totalCashCompensation: number;      // Base + Variable
  totalDirectCompensation: number;    // Cash + Equity
  totalRewardsValue: number;          // Direct + Benefits + Perks
  
  // Breakdown
  compensationBreakdown: CompensationBreakdownItem[];
  
  // Comparison
  yearOverYearChange?: number;
  marketPositionPercentile?: number;
  
  // PDF
  pdfUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CompensationBreakdownItem {
  category: string;
  subcategory?: string;
  label: string;
  value: number;
  percentage: number;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKET DATA & BENCHMARKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface MarketSurvey {
  id: string;
  name: string;
  provider: string;               // Mercer, Willis Towers Watson, etc.
  surveyYear: number;
  effectiveDate: Date;
  
  industry?: string;
  region?: string;
  companySize?: string;
  
  jobs: MarketSurveyJob[];
  
  importedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketSurveyJob {
  id: string;
  surveyId: string;
  
  jobCode: string;
  jobTitle: string;
  jobFamily?: string;
  jobLevel?: string;
  
  // Market data points
  baseSalaryP10: number;
  baseSalaryP25: number;
  baseSalaryP50: number;
  baseSalaryP75: number;
  baseSalaryP90: number;
  
  totalCashP10?: number;
  totalCashP25?: number;
  totalCashP50?: number;
  totalCashP75?: number;
  totalCashP90?: number;
  
  // Sample info
  sampleSize: number;
  sampleCompanies?: number;
  
  // Aging
  agingDate: Date;
  agingFactor: number;            // Annual aging %
  
  // Mapping
  internalJobIds: string[];
  internalGradeIds: string[];
}

export interface CompensationBenchmark {
  id: string;
  employeeId: string;
  
  // Internal data
  currentBaseSalary: number;
  currentTotalCash: number;
  jobTitle: string;
  gradeId: string;
  
  // Market data
  marketSurveyJobId?: string;
  marketP25: number;
  marketP50: number;
  marketP75: number;
  
  // Analysis
  compaRatio: number;              // Current / Market P50
  rangePosition: number;           // Position within grade range
  marketPositionPercentile: number;
  
  // Flags
  isBelowMarket: boolean;          // < P25
  isAboveMarket: boolean;          // > P75
  isCompressionRisk: boolean;      // Close to reports' salaries
  isInversionRisk: boolean;        // Below reports' salaries
  
  analysisDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationAnalytics {
  cycleId?: string;
  asOfDate: Date;
  
  // Budget summary
  budgetSummary: {
    totalBudget: number;
    allocatedBudget: number;
    usedBudget: number;
    remainingBudget: number;
    utilizationPercentage: number;
  };
  
  // Adjustment summary
  adjustmentSummary: {
    totalEmployees: number;
    employeesWithAdjustments: number;
    averageIncreasePercentage: number;
    medianIncreasePercentage: number;
    totalIncreaseAmount: number;
    
    byType: {
      type: AdjustmentType;
      count: number;
      totalAmount: number;
      averagePercentage: number;
    }[];
  };
  
  // Distribution analysis
  distributionAnalysis: {
    byDepartment: DepartmentCompStats[];
    byGrade: GradeCompStats[];
    byPerformance: PerformanceCompStats[];
    byTenure: TenureCompStats[];
  };
  
  // Compa-ratio analysis
  compaRatioAnalysis: {
    averageCompaRatio: number;
    medianCompaRatio: number;
    compaRatioDistribution: {
      category: CompaRatioCategory;
      count: number;
      percentage: number;
    }[];
  };
  
  // Equity analysis
  equityAnalysis: {
    genderPayGap?: number;
    departmentVariance: number;
    gradeCompliance: number;        // % within grade range
  };
}

export interface DepartmentCompStats {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  budget: number;
  used: number;
  averageIncrease: number;
  averageCompaRatio: number;
}

export interface GradeCompStats {
  gradeId: string;
  gradeName: string;
  employeeCount: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  averageCompaRatio: number;
  belowRangeCount: number;
  aboveRangeCount: number;
}

export interface PerformanceCompStats {
  performanceRating: string;
  employeeCount: number;
  averageIncrease: number;
  averageCompaRatio: number;
  budgetShare: number;
}

export interface TenureCompStats {
  tenureBand: string;              // '0-1 years', '1-3 years', etc.
  employeeCount: number;
  averageSalary: number;
  averageIncrease: number;
  averageCompaRatio: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW & NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationWorkflow {
  id: string;
  cycleId: string;
  name: string;
  
  steps: CompensationWorkflowStep[];
  
  currentStepIndex: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CompensationWorkflowStep {
  id: string;
  workflowId: string;
  stepNumber: number;
  
  name: string;
  description?: string;
  
  // Approvers
  approverType: 'MANAGER' | 'HR' | 'EXECUTIVE' | 'CUSTOM';
  approverRoleId?: string;
  approverEmployeeIds?: string[];
  
  // Conditions
  triggerCondition?: {
    field: string;
    operator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
    value: number | string;
  };
  
  // Deadlines
  dueDate?: Date;
  reminderDays: number[];
  escalationDays?: number;
  
  // Status
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedAt?: Date;
  completedBy?: string;
}

export interface CompensationNotification {
  id: string;
  cycleId: string;
  
  type: 'CYCLE_STARTED' | 'PLANNING_REMINDER' | 'REVIEW_ASSIGNED' | 
        'APPROVAL_REQUIRED' | 'ADJUSTMENT_APPROVED' | 'ADJUSTMENT_REJECTED' |
        'CYCLE_COMPLETED' | 'DEADLINE_REMINDER';
  
  recipientId: string;
  recipientEmail: string;
  
  subject: string;
  body: string;
  
  relatedAdjustmentId?: string;
  relatedEmployeeId?: string;
  
  sentAt?: Date;
  readAt?: Date;
  
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateCompensationCycleDto {
  name: string;
  description?: string;
  fiscalYear: number;
  cycleType: 'ANNUAL' | 'MID_YEAR' | 'QUARTERLY' | 'AD_HOC';
  startDate: Date;
  endDate: Date;
  effectiveDate: Date;
  totalBudget: number;
  currency: string;
  eligibilityCriteria: EligibilityCriteria;
  timeline: {
    planningStartDate: Date;
    planningEndDate: Date;
    managerReviewStartDate: Date;
    managerReviewEndDate: Date;
    approvalStartDate: Date;
    approvalEndDate: Date;
  };
}

export interface CreateAdjustmentDto {
  cycleId: string;
  employeeId: string;
  adjustmentType: AdjustmentType;
  proposedIncreasePercentage?: number;
  proposedIncreaseAmount?: number;
  proposedSalaryGradeId?: string;
  bonusAmount?: number;
  bonusType?: string;
  justification?: string;
  effectiveDate: Date;
}

export interface BulkAdjustmentDto {
  cycleId: string;
  adjustments: CreateAdjustmentDto[];
}

export interface ApproveAdjustmentDto {
  adjustmentId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION';
  comments?: string;
  modifiedAmount?: number;
  modifiedPercentage?: number;
}

export interface CompensationCycleFilters {
  fiscalYear?: number;
  status?: CompensationCycleStatus;
  cycleType?: string;
}

export interface AdjustmentFilters {
  cycleId: string;
  departmentId?: string;
  managerId?: string;
  status?: ApprovalStatus;
  adjustmentType?: AdjustmentType;
  employeeSearch?: string;
}
