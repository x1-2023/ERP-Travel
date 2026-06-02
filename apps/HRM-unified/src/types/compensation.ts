// Sprint 11: Compensation & Benefits Types

export interface SalaryGrade {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  level: number;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeritMatrix {
  id: string;
  tenantId: string;
  performanceRating: number;
  compaRatioMin: number;
  compaRatioMax: number;
  meritIncreasePercent: number;
  compaRatioLabel?: string;
  effectiveYear: number;
  isActive: boolean;
}

export interface CompensationCycle {
  id: string;
  tenantId: string;
  name: string;
  year: number;
  status: string;
  startDate: Date;
  endDate: Date;
  budgetPercent?: number;
  notes?: string;
  reviews?: CompensationReview[];
  budgets?: CompensationBudget[];
}

export interface CompensationReview {
  id: string;
  tenantId: string;
  cycleId: string;
  employeeId: string;
  status: string;
  currentSalary: number;
  proposedSalary?: number;
  approvedSalary?: number;
  changeType?: string;
  changePercent?: number;
  performanceRating?: number;
  compaRatio?: number;
  justification?: string;
  managerComments?: string;
  hrComments?: string;
  effectiveDate?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedById?: string;
  employee?: {
    id: string;
    fullName: string;
    employeeCode: string;
    department?: { name: string };
    position?: { name: string };
  };
  cycle?: CompensationCycle;
}

export interface CompensationChange {
  id: string;
  tenantId: string;
  employeeId: string;
  changeType: string;
  effectiveDate: Date;
  previousSalary: number;
  newSalary: number;
  changePercent: number;
  previousGradeId?: string;
  newGradeId?: string;
  reason?: string;
  employee?: { fullName: string; employeeCode: string };
}

export interface CompensationBudget {
  id: string;
  tenantId: string;
  cycleId: string;
  departmentId?: string;
  totalBudget: number;
  allocatedAmount: number;
  spentAmount: number;
  headcount: number;
  notes?: string;
  department?: { name: string };
}

export interface EmployeeCompensation {
  id: string;
  tenantId: string;
  employeeId: string;
  baseSalary: number;
  currency: string;
  gradeId?: string;
  effectiveDate: Date;
  salaryType: string;
  payFrequency: string;
  isCurrent: boolean;
  grade?: SalaryGrade;
  employee?: { fullName: string; employeeCode: string; department?: { name: string } };
}

export interface BenefitPlan {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  employerContribution?: number;
  employeeContribution?: number;
  contributionPercent?: number;
  ceilingAmount?: number;
  eligibilityCriteria?: Record<string, unknown>;
  isActive: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  enrollments?: BenefitEnrollment[];
}

export interface BenefitEnrollment {
  id: string;
  tenantId: string;
  employeeId: string;
  planId: string;
  status: string;
  enrollmentDate?: Date;
  effectiveDate?: Date;
  endDate?: Date;
  employerAmount?: number;
  employeeAmount?: number;
  notes?: string;
  plan?: BenefitPlan;
  employee?: { fullName: string; employeeCode: string };
}

export interface AllowanceType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  defaultAmount?: number;
  frequency: string;
  isTaxable: boolean;
  isInsurable: boolean;
  isActive: boolean;
}

export interface EmployeeAllowance {
  id: string;
  tenantId: string;
  employeeId: string;
  allowanceTypeId: string;
  amount: number;
  frequency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  notes?: string;
  allowanceType?: AllowanceType;
  employee?: { fullName: string; employeeCode: string };
}

export interface TotalRewardsStatement {
  id: string;
  tenantId: string;
  employeeId: string;
  year: number;
  baseSalary: number;
  totalAllowances: number;
  totalBenefitsValue: number;
  employerContributions: number;
  totalRewards: number;
  generatedAt: Date;
  details?: Record<string, unknown>;
  employee?: { fullName: string; employeeCode: string; department?: { name: string } };
}

export interface PayEquityAnalysis {
  id: string;
  tenantId: string;
  analysisDate: Date;
  departmentId?: string;
  gradeId?: string;
  genderGap?: number;
  avgMaleSalary?: number;
  avgFemaleSalary?: number;
  medianSalary?: number;
  avgCompaRatio?: number;
  headcount: number;
  findings?: Record<string, unknown>;
  recommendations?: string;
  department?: { name: string };
}

export interface CompensationBenchmark {
  id: string;
  tenantId: string;
  positionTitle: string;
  gradeLevel?: number;
  industry?: string;
  location?: string;
  percentile25?: number;
  percentile50?: number;
  percentile75?: number;
  percentile90?: number;
  surveySource?: string;
  surveyYear?: number;
  currency: string;
}

export interface CompensationHistory {
  id: string;
  tenantId: string;
  employeeId: string;
  eventType: string;
  eventDate: Date;
  previousValue?: number;
  newValue?: number;
  changePercent?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CompensationAnalytics {
  totalEmployees: number;
  avgSalary: number;
  medianSalary: number;
  avgCompaRatio: number;
  totalPayroll: number;
  budgetUtilization: number;
  pendingReviews: number;
  completedReviews: number;
  gradeDistribution: { grade: string; count: number; avgSalary: number }[];
  departmentStats: { department: string; headcount: number; avgSalary: number; avgCompaRatio: number }[];
}
