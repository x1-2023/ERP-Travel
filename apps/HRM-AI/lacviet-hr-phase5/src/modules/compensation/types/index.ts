// src/modules/compensation/types/index.ts

/**
 * LAC VIET HR - Compensation Planning Types
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum PayFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

export enum CompChangeReason {
  NEW_HIRE = 'NEW_HIRE',
  PROMOTION = 'PROMOTION',
  MERIT_INCREASE = 'MERIT_INCREASE',
  MARKET_ADJUSTMENT = 'MARKET_ADJUSTMENT',
  EQUITY_ADJUSTMENT = 'EQUITY_ADJUSTMENT',
  DEMOTION = 'DEMOTION',
  TRANSFER = 'TRANSFER',
  ANNUAL_REVIEW = 'ANNUAL_REVIEW',
  RETENTION = 'RETENTION',
  CORRECTION = 'CORRECTION',
  OTHER = 'OTHER',
}

export enum ReviewCycleStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  MANAGER_INPUT = 'MANAGER_INPUT',
  HR_REVIEW = 'HR_REVIEW',
  CALIBRATION = 'CALIBRATION',
  APPROVAL = 'APPROVAL',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RecommendationType {
  NO_CHANGE = 'NO_CHANGE',
  MERIT_ONLY = 'MERIT_ONLY',
  PROMOTION = 'PROMOTION',
  MARKET_ADJUSTMENT = 'MARKET_ADJUSTMENT',
  EQUITY_ADJUSTMENT = 'EQUITY_ADJUSTMENT',
  COMBINED = 'COMBINED',
  LUMP_SUM = 'LUMP_SUM',
}

export enum RecommendationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  HR_REVIEW = 'HR_REVIEW',
  CALIBRATION = 'CALIBRATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Salary Structure
// ═══════════════════════════════════════════════════════════════════════════════

export interface SalaryGrade {
  id: string;
  code: string;
  name: string;
  level: number;
  description?: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
  minCompaRatio: number;
  maxCompaRatio: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    positions: number;
    employees: number;
  };
}

export interface SalaryBand {
  id: string;
  gradeId: string;
  jobFamilyId?: string;
  name: string;
  minimum: number;
  firstQuartile: number;
  midpoint: number;
  thirdQuartile: number;
  maximum: number;
  marketMedian?: number;
  marketSource?: string;
  marketDate?: Date;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  grade?: SalaryGrade;
  jobFamily?: JobFamily;
}

export interface JobFamily {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  parent?: JobFamily;
  children?: JobFamily[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Employee Compensation
// ═══════════════════════════════════════════════════════════════════════════════

export interface Allowances {
  housing?: number;
  transport?: number;
  meal?: number;
  phone?: number;
  responsibility?: number;
  performance?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface EmployeeCompensation {
  id: string;
  employeeId: string;
  baseSalary: number;
  currency: string;
  payFrequency: PayFrequency;
  gradeId?: string;
  compaRatio?: number;
  rangePosition?: number;
  marketRatio?: number;
  bonusTargetPercent?: number;
  allowances?: Allowances;
  totalAllowances?: number;
  totalCash?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isCurrent: boolean;
  changeReason?: CompChangeReason;
  changePercent?: number;
  previousSalary?: number;
  approvedById?: string;
  approvedAt?: Date;
  notes?: string;
  employee?: EmployeeSummary;
  grade?: SalaryGrade;
}

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: { id: string; name: string };
  position?: { id: string; name: string };
  hireDate: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Review Cycle
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompReviewCycle {
  id: string;
  name: string;
  fiscalYear: number;
  totalBudget: number;
  meritPoolPercent: number;
  promoPoolPercent: number;
  equityPoolPercent: number;
  allocatedBudget?: number;
  spentBudget?: number;
  meritMatrixId?: string;
  guidelines?: ReviewGuidelines;
  planningStart: Date;
  managerInputStart: Date;
  managerInputEnd: Date;
  hrReviewStart: Date;
  hrReviewEnd: Date;
  calibrationStart: Date;
  calibrationEnd: Date;
  approvalDeadline: Date;
  effectiveDate: Date;
  status: ReviewCycleStatus;
  meritMatrix?: MeritMatrix;
  _count?: {
    recommendations: number;
    deptBudgets: number;
  };
}

export interface ReviewGuidelines {
  maxMeritPercent: number;
  minMeritPercent: number;
  maxPromoPercent: number;
  maxEquityPercent: number;
  requiresApprovalAbove: number;
  notes?: string;
}

export interface MeritMatrix {
  id: string;
  name: string;
  description?: string;
  fiscalYear: number;
  matrixData: MeritMatrixData;
  isActive: boolean;
}

export interface MeritMatrixData {
  performanceScale: string[];
  compaRatioRanges: { min: number; max: number; label: string }[];
  cells: { [performance: string]: { [compaRange: string]: number } };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Budget
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeptBudget {
  id: string;
  cycleId: string;
  departmentId: string;
  totalBudget: number;
  meritBudget: number;
  promoBudget: number;
  equityBudget: number;
  meritSpent: number;
  promoSpent: number;
  equitySpent: number;
  eligibleCount: number;
  totalPayroll?: number;
  avgCompaRatio?: number;
  isApproved: boolean;
  approvedById?: string;
  approvedAt?: Date;
  department?: { id: string; name: string; code: string };
  cycle?: CompReviewCycle;
}

export interface BudgetSummary {
  totalBudget: number;
  allocated: number;
  spent: number;
  remaining: number;
  byType: {
    merit: { allocated: number; spent: number; remaining: number };
    promo: { allocated: number; spent: number; remaining: number };
    equity: { allocated: number; spent: number; remaining: number };
  };
  byDepartment: DeptBudget[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Recommendation
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompRecommendation {
  id: string;
  cycleId: string;
  employeeId: string;
  currentSalary: number;
  currentGradeId?: string;
  currentCompaRatio?: number;
  performanceRating?: string;
  recommendationType: RecommendationType;
  proposedSalary: number;
  proposedGradeId?: string;
  increaseAmount: number;
  increasePercent: number;
  meritPercent?: number;
  promoPercent?: number;
  equityPercent?: number;
  newCompaRatio?: number;
  status: RecommendationStatus;
  managerId?: string;
  managerComments?: string;
  managerSubmittedAt?: Date;
  hrReviewerId?: string;
  hrComments?: string;
  hrReviewedAt?: Date;
  isCalibrated: boolean;
  calibrationNotes?: string;
  approvedById?: string;
  approvedAt?: Date;
  isException: boolean;
  exceptionReason?: string;
  employee?: EmployeeSummary;
  cycle?: CompReviewCycle;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Total Rewards
// ═══════════════════════════════════════════════════════════════════════════════

export interface TotalRewardsStatement {
  id: string;
  employeeId: string;
  fiscalYear: number;
  generatedAt: Date;
  baseSalary: number;
  bonusPaid?: number;
  overtimePaid?: number;
  allowancesPaid?: number;
  totalCash: number;
  healthInsurance?: number;
  socialInsurance?: number;
  otherBenefits?: number;
  totalBenefits?: number;
  totalRewards: number;
  breakdownJson?: RewardsBreakdown;
  pdfUrl?: string;
  viewedAt?: Date;
  acknowledgedAt?: Date;
  employee?: EmployeeSummary;
}

export interface RewardsBreakdown {
  cashCompensation: {
    baseSalary: number;
    bonus: number;
    overtime: number;
    allowances: Allowances;
    total: number;
  };
  benefits: {
    healthInsurance: number;
    socialInsurance: number;
    unemploymentInsurance: number;
    other: number;
    total: number;
  };
  timeOff: {
    ptoValue: number;
    holidaysValue: number;
    total: number;
  };
  total: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES - Analytics
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationAnalytics {
  summary: {
    totalEmployees: number;
    totalPayroll: number;
    avgSalary: number;
    medianSalary: number;
    avgCompaRatio: number;
  };
  distribution: {
    byGrade: { gradeId: string; gradeName: string; count: number; avgSalary: number }[];
    byDepartment: { deptId: string; deptName: string; count: number; avgSalary: number; avgCompaRatio: number }[];
    byCompaRatio: { range: string; count: number; percent: number }[];
  };
  marketPosition: {
    belowMarket: number;
    atMarket: number;
    aboveMarket: number;
  };
  trends?: {
    period: string;
    avgSalary: number;
    avgIncrease: number;
  }[];
}

export interface CompaRatioAnalysis {
  gradeId: string;
  gradeName: string;
  employees: {
    id: string;
    name: string;
    salary: number;
    compaRatio: number;
    rangePosition: number;
    status: 'BELOW_MIN' | 'IN_RANGE' | 'ABOVE_MAX';
  }[];
  stats: {
    belowMin: number;
    inRange: number;
    aboveMax: number;
    avgCompaRatio: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateSalaryGradeInput {
  code: string;
  name: string;
  level: number;
  description?: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency?: string;
  effectiveFrom: Date;
}

export interface UpdateSalaryGradeInput extends Partial<CreateSalaryGradeInput> {
  isActive?: boolean;
  effectiveTo?: Date;
}

export interface CreateReviewCycleInput {
  name: string;
  fiscalYear: number;
  totalBudget: number;
  meritPoolPercent: number;
  promoPoolPercent: number;
  equityPoolPercent: number;
  meritMatrixId?: string;
  planningStart: Date;
  managerInputStart: Date;
  managerInputEnd: Date;
  hrReviewStart: Date;
  hrReviewEnd: Date;
  calibrationStart: Date;
  calibrationEnd: Date;
  approvalDeadline: Date;
  effectiveDate: Date;
}

export interface CreateRecommendationInput {
  cycleId: string;
  employeeId: string;
  recommendationType: RecommendationType;
  proposedSalary: number;
  proposedGradeId?: string;
  meritPercent?: number;
  promoPercent?: number;
  equityPercent?: number;
  managerComments?: string;
}

export interface UpdateCompensationInput {
  baseSalary: number;
  gradeId?: string;
  bonusTargetPercent?: number;
  allowances?: Allowances;
  changeReason: CompChangeReason;
  effectiveFrom: Date;
  notes?: string;
}

export interface AllocateBudgetInput {
  cycleId: string;
  allocations: {
    departmentId: string;
    meritBudget: number;
    promoBudget: number;
    equityBudget: number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompensationFilters {
  departmentId?: string;
  gradeId?: string;
  jobFamilyId?: string;
  minSalary?: number;
  maxSalary?: number;
  minCompaRatio?: number;
  maxCompaRatio?: number;
  search?: string;
}

export interface RecommendationFilters {
  cycleId: string;
  departmentId?: string;
  status?: RecommendationStatus;
  type?: RecommendationType;
  minIncreasePercent?: number;
  maxIncreasePercent?: number;
  isException?: boolean;
  search?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPA_RATIO_RANGES = [
  { min: 0, max: 0.80, label: 'Below 80%', status: 'critical' },
  { min: 0.80, max: 0.90, label: '80-90%', status: 'warning' },
  { min: 0.90, max: 1.00, label: '90-100%', status: 'normal' },
  { min: 1.00, max: 1.10, label: '100-110%', status: 'normal' },
  { min: 1.10, max: 1.20, label: '110-120%', status: 'warning' },
  { min: 1.20, max: Infinity, label: 'Above 120%', status: 'critical' },
];

export const DEFAULT_MERIT_MATRIX: MeritMatrixData = {
  performanceScale: ['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT'],
  compaRatioRanges: [
    { min: 0.80, max: 0.90, label: '80-90%' },
    { min: 0.90, max: 1.00, label: '90-100%' },
    { min: 1.00, max: 1.10, label: '100-110%' },
    { min: 1.10, max: 1.20, label: '110-120%' },
  ],
  cells: {
    EXCEEDS: { '80-90%': 8, '90-100%': 6, '100-110%': 5, '110-120%': 4 },
    MEETS: { '80-90%': 5, '90-100%': 4, '100-110%': 3, '110-120%': 2 },
    NEEDS_IMPROVEMENT: { '80-90%': 2, '90-100%': 1, '100-110%': 0, '110-120%': 0 },
  },
};

export const CHANGE_REASON_LABELS: Record<CompChangeReason, string> = {
  [CompChangeReason.NEW_HIRE]: 'Nhân viên mới',
  [CompChangeReason.PROMOTION]: 'Thăng chức',
  [CompChangeReason.MERIT_INCREASE]: 'Tăng lương theo hiệu suất',
  [CompChangeReason.MARKET_ADJUSTMENT]: 'Điều chỉnh theo thị trường',
  [CompChangeReason.EQUITY_ADJUSTMENT]: 'Điều chỉnh công bằng',
  [CompChangeReason.DEMOTION]: 'Giáng chức',
  [CompChangeReason.TRANSFER]: 'Chuyển đổi vị trí',
  [CompChangeReason.ANNUAL_REVIEW]: 'Đánh giá hàng năm',
  [CompChangeReason.RETENTION]: 'Giữ chân nhân tài',
  [CompChangeReason.CORRECTION]: 'Điều chỉnh sửa lỗi',
  [CompChangeReason.OTHER]: 'Khác',
};

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  [RecommendationType.NO_CHANGE]: 'Không thay đổi',
  [RecommendationType.MERIT_ONLY]: 'Chỉ tăng theo hiệu suất',
  [RecommendationType.PROMOTION]: 'Thăng chức',
  [RecommendationType.MARKET_ADJUSTMENT]: 'Điều chỉnh thị trường',
  [RecommendationType.EQUITY_ADJUSTMENT]: 'Điều chỉnh công bằng',
  [RecommendationType.COMBINED]: 'Kết hợp',
  [RecommendationType.LUMP_SUM]: 'Thưởng một lần',
};
