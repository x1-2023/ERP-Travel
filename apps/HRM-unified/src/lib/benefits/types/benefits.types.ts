// benefits-administration/types/benefits.types.ts

/**
 * LAC VIET HR - Benefits Administration Types
 * Comprehensive employee benefits management system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum BenefitCategory {
  HEALTH = 'HEALTH',
  DENTAL = 'DENTAL',
  VISION = 'VISION',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  DISABILITY = 'DISABILITY',
  RETIREMENT = 'RETIREMENT',
  PAID_TIME_OFF = 'PAID_TIME_OFF',
  WELLNESS = 'WELLNESS',
  EDUCATION = 'EDUCATION',
  TRANSPORTATION = 'TRANSPORTATION',
  MEAL = 'MEAL',
  HOUSING = 'HOUSING',
  CHILDCARE = 'CHILDCARE',
  FLEXIBLE_SPENDING = 'FLEXIBLE_SPENDING',
  STOCK = 'STOCK',
  OTHER = 'OTHER',
}

export enum BenefitType {
  // Health
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  SUPPLEMENTAL_HEALTH = 'SUPPLEMENTAL_HEALTH',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  
  // Insurance
  LIFE_INSURANCE_BASIC = 'LIFE_INSURANCE_BASIC',
  LIFE_INSURANCE_SUPPLEMENTAL = 'LIFE_INSURANCE_SUPPLEMENTAL',
  AD_D = 'AD_D',
  SHORT_TERM_DISABILITY = 'SHORT_TERM_DISABILITY',
  LONG_TERM_DISABILITY = 'LONG_TERM_DISABILITY',
  
  // Retirement
  PENSION = 'PENSION',
  PROVIDENT_FUND = 'PROVIDENT_FUND',
  RETIREMENT_SAVINGS = 'RETIREMENT_SAVINGS',
  
  // Time Off
  ANNUAL_LEAVE = 'ANNUAL_LEAVE',
  SICK_LEAVE = 'SICK_LEAVE',
  PARENTAL_LEAVE = 'PARENTAL_LEAVE',
  BEREAVEMENT_LEAVE = 'BEREAVEMENT_LEAVE',
  
  // Allowances
  MEAL_ALLOWANCE = 'MEAL_ALLOWANCE',
  TRANSPORTATION_ALLOWANCE = 'TRANSPORTATION_ALLOWANCE',
  PHONE_ALLOWANCE = 'PHONE_ALLOWANCE',
  HOUSING_ALLOWANCE = 'HOUSING_ALLOWANCE',
  REMOTE_WORK_ALLOWANCE = 'REMOTE_WORK_ALLOWANCE',
  
  // Education
  TUITION_REIMBURSEMENT = 'TUITION_REIMBURSEMENT',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  CERTIFICATION_SUPPORT = 'CERTIFICATION_SUPPORT',
  
  // Wellness
  GYM_MEMBERSHIP = 'GYM_MEMBERSHIP',
  WELLNESS_PROGRAM = 'WELLNESS_PROGRAM',
  EAP = 'EAP', // Employee Assistance Program
  
  // Flexible
  FSA = 'FSA', // Flexible Spending Account
  HSA = 'HSA', // Health Savings Account
  
  // Stock
  ESPP = 'ESPP', // Employee Stock Purchase Plan
  RSU = 'RSU',   // Restricted Stock Units
  STOCK_OPTIONS = 'STOCK_OPTIONS',
}

export enum EnrollmentStatus {
  NOT_ENROLLED = 'NOT_ENROLLED',
  PENDING = 'PENDING',
  ENROLLED = 'ENROLLED',
  WAIVED = 'WAIVED',
  TERMINATED = 'TERMINATED',
  PENDING_TERMINATION = 'PENDING_TERMINATION',
}

export enum EnrollmentPeriodType {
  OPEN_ENROLLMENT = 'OPEN_ENROLLMENT',
  NEW_HIRE = 'NEW_HIRE',
  QUALIFYING_LIFE_EVENT = 'QUALIFYING_LIFE_EVENT',
  SPECIAL_ENROLLMENT = 'SPECIAL_ENROLLMENT',
}

export enum LifeEventType {
  MARRIAGE = 'MARRIAGE',
  DIVORCE = 'DIVORCE',
  BIRTH_ADOPTION = 'BIRTH_ADOPTION',
  DEATH_OF_DEPENDENT = 'DEATH_OF_DEPENDENT',
  LOSS_OF_COVERAGE = 'LOSS_OF_COVERAGE',
  CHANGE_IN_EMPLOYMENT_STATUS = 'CHANGE_IN_EMPLOYMENT_STATUS',
  RELOCATION = 'RELOCATION',
  LEGAL_SEPARATION = 'LEGAL_SEPARATION',
  DEPENDENT_AGING_OUT = 'DEPENDENT_AGING_OUT',
  COURT_ORDER = 'COURT_ORDER',
}

export enum DependentType {
  SPOUSE = 'SPOUSE',
  DOMESTIC_PARTNER = 'DOMESTIC_PARTNER',
  CHILD = 'CHILD',
  STEP_CHILD = 'STEP_CHILD',
  ADOPTED_CHILD = 'ADOPTED_CHILD',
  FOSTER_CHILD = 'FOSTER_CHILD',
  PARENT = 'PARENT',
  OTHER = 'OTHER',
}

export enum DependentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  INELIGIBLE = 'INELIGIBLE',
}

export enum CoverageLevel {
  EMPLOYEE_ONLY = 'EMPLOYEE_ONLY',
  EMPLOYEE_SPOUSE = 'EMPLOYEE_SPOUSE',
  EMPLOYEE_CHILDREN = 'EMPLOYEE_CHILDREN',
  EMPLOYEE_FAMILY = 'EMPLOYEE_FAMILY',
}

export enum ContributionType {
  FLAT_AMOUNT = 'FLAT_AMOUNT',
  PERCENTAGE_SALARY = 'PERCENTAGE_SALARY',
  TIERED = 'TIERED',
  MATCHING = 'MATCHING',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  SEMI_MONTHLY = 'SEMI_MONTHLY',
  BI_WEEKLY = 'BI_WEEKLY',
  WEEKLY = 'WEEKLY',
  ANNUAL = 'ANNUAL',
  ONE_TIME = 'ONE_TIME',
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENEFIT PLANS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BenefitPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  
  category: BenefitCategory;
  type: BenefitType;
  
  // Provider
  providerId?: string;
  provider?: BenefitProvider;
  policyNumber?: string;
  groupNumber?: string;
  
  // Eligibility
  eligibilityRules: EligibilityRule[];
  waitingPeriodDays: number;
  
  // Coverage options
  coverageOptions: CoverageOption[];
  
  // Cost
  employerContribution: ContributionStructure;
  employeeContribution: ContributionStructure;
  
  // Limits
  annualMaximum?: number;
  lifetimeMaximum?: number;
  
  // Dates
  effectiveDate: Date;
  terminationDate?: Date;
  
  // Documents
  summaryPlanDocumentUrl?: string;
  certificateOfCoverageUrl?: string;
  
  isActive: boolean;
  isDefault: boolean;
  
  // Vietnam specific
  isSocialInsurance: boolean;     // BHXH
  isHealthInsurance: boolean;     // BHYT
  isUnemploymentInsurance: boolean; // BHTN
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BenefitProvider {
  id: string;
  name: string;
  code: string;
  
  type: 'INSURANCE' | 'HEALTHCARE' | 'RETIREMENT' | 'WELLNESS' | 'OTHER';
  
  // Contact
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: string;
  city?: string;
  province?: string;
  country: string;
  
  // Integration
  apiEndpoint?: string;
  apiKey?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityRule {
  id: string;
  planId: string;
  
  // Criteria
  employmentTypes: string[];      // FULL_TIME, PART_TIME, CONTRACT
  employmentStatuses: string[];   // ACTIVE, PROBATION
  minTenureMonths?: number;
  maxTenureMonths?: number;
  minAge?: number;
  maxAge?: number;
  
  // Inclusion/Exclusion
  includedDepartmentIds?: string[];
  excludedDepartmentIds?: string[];
  includedGradeIds?: string[];
  excludedGradeIds?: string[];
  includedLocationIds?: string[];
  
  isActive: boolean;
}

export interface CoverageOption {
  id: string;
  planId: string;
  
  name: string;
  description?: string;
  
  coverageLevel: CoverageLevel;
  
  // Coverage details
  coverageAmount?: number;
  coverageMultiplier?: number;    // e.g., 2x salary
  deductible?: number;
  coinsurance?: number;           // Percentage
  copay?: number;
  outOfPocketMax?: number;
  
  // Cost
  employerCost: number;
  employeeCost: number;
  totalCost: number;
  
  paymentFrequency: PaymentFrequency;
  
  // Dependents
  maxDependents?: number;
  dependentCostPerPerson?: number;
  
  isDefault: boolean;
  isActive: boolean;
}

export interface ContributionStructure {
  type: ContributionType;
  
  // For FLAT_AMOUNT
  amount?: number;
  
  // For PERCENTAGE_SALARY
  percentage?: number;
  maxAmount?: number;
  minAmount?: number;
  
  // For TIERED
  tiers?: ContributionTier[];
  
  // For MATCHING
  matchPercentage?: number;
  maxMatchPercentage?: number;
  vestingScheduleId?: string;
}

export interface ContributionTier {
  minSalary: number;
  maxSalary: number;
  amount?: number;
  percentage?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENROLLMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface EnrollmentPeriod {
  id: string;
  name: string;
  description?: string;
  
  type: EnrollmentPeriodType;
  
  // Dates
  startDate: Date;
  endDate: Date;
  effectiveDate: Date;          // When elections take effect
  
  // Plans available
  availablePlanIds: string[];
  
  // Eligibility
  eligibleEmployeeIds?: string[];
  eligibleDepartmentIds?: string[];
  
  // Settings
  allowWaiver: boolean;
  requireEvidence: boolean;      // Evidence of insurability
  
  // Status
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  
  // Reminders
  reminderDays: number[];        // Days before end to remind
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  planId: string;
  plan: BenefitPlan;
  
  enrollmentPeriodId?: string;
  enrollmentPeriod?: EnrollmentPeriod;
  
  // Status
  status: EnrollmentStatus;
  
  // Coverage selection
  coverageOptionId: string;
  coverageOption: CoverageOption;
  coverageLevel: CoverageLevel;
  
  // Dependents
  enrolledDependentIds: string[];
  enrolledDependents?: Dependent[];
  
  // Cost
  employerContribution: number;
  employeeContribution: number;
  totalCost: number;
  paymentFrequency: PaymentFrequency;
  
  // Dates
  enrollmentDate: Date;
  effectiveDate: Date;
  terminationDate?: Date;
  
  // Life event
  lifeEventId?: string;
  lifeEvent?: LifeEvent;
  
  // Documents
  enrollmentFormUrl?: string;
  signedDate?: Date;
  
  // Waiver
  isWaived: boolean;
  waiverReason?: string;
  alternativeCoverageProof?: string;
  
  // Beneficiaries (for life insurance)
  beneficiaries?: Beneficiary[];
  
  // Notes
  notes?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LifeEvent {
  id: string;
  employeeId: string;
  
  type: LifeEventType;
  eventDate: Date;
  
  // Details
  description?: string;
  
  // Documentation
  documentUrls: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedDate?: Date;
  
  // Enrollment window
  enrollmentWindowStart: Date;
  enrollmentWindowEnd: Date;
  
  // Related enrollments
  enrollmentIds: string[];
  
  // Status
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  rejectionReason?: string;
  
  submittedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPENDENTS & BENEFICIARIES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Dependent {
  id: string;
  employeeId: string;
  
  // Personal info
  firstName: string;
  lastName: string;
  fullName: string;
  
  relationship: DependentType;
  
  dateOfBirth: Date;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  
  // Identification
  nationalId?: string;
  socialSecurityNumber?: string;
  
  // Contact
  email?: string;
  phone?: string;
  
  // Address (if different from employee)
  address?: string;
  city?: string;
  province?: string;
  
  // Eligibility
  status: DependentStatus;
  isEligible: boolean;
  eligibilityEndDate?: Date;       // For children aging out
  
  // Student status (for adult children)
  isFullTimeStudent: boolean;
  schoolName?: string;
  expectedGraduationDate?: Date;
  
  // Disability status
  isDisabled: boolean;
  disabilityDocumentUrl?: string;
  
  // Verification
  verificationDocumentUrls: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedDate?: Date;
  
  // Enrolled benefits
  enrolledPlanIds: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Beneficiary {
  id: string;
  employeeId: string;
  enrollmentId: string;
  
  // Personal info
  firstName: string;
  lastName: string;
  fullName: string;
  
  relationship: string;
  
  dateOfBirth?: Date;
  
  // Identification
  nationalId?: string;
  
  // Contact
  email?: string;
  phone?: string;
  address?: string;
  
  // Allocation
  type: 'PRIMARY' | 'CONTINGENT';
  percentage: number;
  
  // Verification
  verificationStatus: 'PENDING' | 'VERIFIED';
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLAIMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BenefitClaim {
  id: string;
  claimNumber: string;
  
  employeeId: string;
  enrollmentId: string;
  planId: string;
  
  // Claim details
  claimType: string;
  serviceDate: Date;
  submissionDate: Date;
  
  // Provider
  providerName?: string;
  providerAddress?: string;
  
  // For dependent
  dependentId?: string;
  dependent?: Dependent;
  
  // Amounts
  claimedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  employeeResponsibility: number;
  
  currency: string;
  
  // Status
  status: ClaimStatus;
  statusHistory: ClaimStatusHistory[];
  
  // Processing
  processedBy?: string;
  processedDate?: Date;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Documents
  receiptUrls: string[];
  supportingDocumentUrls: string[];
  
  // Notes
  description?: string;
  rejectionReason?: string;
  internalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimStatusHistory {
  status: ClaimStatus;
  changedBy: string;
  changedAt: Date;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIETNAM SOCIAL INSURANCE (BHXH)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SocialInsuranceRecord {
  id: string;
  employeeId: string;
  
  // Book number
  socialInsuranceBookNumber: string;
  healthInsuranceCardNumber?: string;
  
  // Registration
  registrationDate: Date;
  registrationLocation: string;
  
  // Contribution history
  totalContributionMonths: number;
  
  // Current period
  currentPeriodStart: Date;
  currentContributionBase: number;    // Mức đóng
  
  // Rates (Vietnam 2024)
  employeeContributionRate: number;   // 10.5% (8% SI + 1.5% HI + 1% UI)
  employerContributionRate: number;   // 21.5% (17.5% SI + 3% HI + 1% UI)
  
  // Monthly amounts
  monthlyEmployeeContribution: number;
  monthlyEmployerContribution: number;
  totalMonthlyContribution: number;
  
  // Status
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  
  // History
  contributionHistory: SIContributionPeriod[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SIContributionPeriod {
  id: string;
  recordId: string;
  
  startDate: Date;
  endDate?: Date;
  
  contributionBase: number;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;
  
  // Breakdown
  socialInsuranceAmount: number;      // BHXH
  healthInsuranceAmount: number;      // BHYT
  unemploymentInsuranceAmount: number; // BHTN
  
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentDate?: Date;
  
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLEXIBLE BENEFITS
// ═══════════════════════════════════════════════════════════════════════════════

export interface FlexibleBenefitProgram {
  id: string;
  name: string;
  description?: string;
  
  // Budget
  annualBudgetPerEmployee: number;
  budgetCalculationType: 'FIXED' | 'SALARY_BASED' | 'GRADE_BASED';
  budgetMultiplier?: number;
  
  // Options
  benefitOptions: FlexibleBenefitOption[];
  
  // Rules
  minSelections?: number;
  maxSelections?: number;
  
  // Dates
  programYear: number;
  enrollmentStartDate: Date;
  enrollmentEndDate: Date;
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  
  // Rollover
  allowRollover: boolean;
  maxRolloverAmount?: number;
  maxRolloverPercentage?: number;
  
  // Status
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlexibleBenefitOption {
  id: string;
  programId: string;
  
  name: string;
  description?: string;
  category: BenefitCategory;
  
  // Cost
  cost: number;
  costType: 'FIXED' | 'VARIABLE' | 'REIMBURSEMENT';
  maxReimbursement?: number;
  
  // Provider
  providerId?: string;
  providerName?: string;
  
  // Limits
  maxQuantity?: number;
  
  // Documents
  termsUrl?: string;
  
  isActive: boolean;
}

export interface FlexibleBenefitElection {
  id: string;
  programId: string;
  employeeId: string;
  
  // Budget
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  
  // Elections
  elections: FlexibleBenefitSelection[];
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ACTIVE';
  
  submittedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FlexibleBenefitSelection {
  id: string;
  electionId: string;
  optionId: string;
  option: FlexibleBenefitOption;
  
  quantity: number;
  cost: number;
  
  // For reimbursement type
  claimedAmount: number;
  reimbursedAmount: number;
  
  status: 'SELECTED' | 'CLAIMED' | 'REIMBURSED' | 'CANCELLED';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface BenefitsAnalytics {
  asOfDate: Date;
  
  // Enrollment summary
  enrollmentSummary: {
    totalEligibleEmployees: number;
    enrolledEmployees: number;
    waivedEmployees: number;
    enrollmentRate: number;
    
    byPlan: {
      planId: string;
      planName: string;
      category: BenefitCategory;
      enrolled: number;
      waived: number;
    }[];
    
    byCoverageLevel: {
      level: CoverageLevel;
      count: number;
      percentage: number;
    }[];
  };
  
  // Cost summary
  costSummary: {
    totalAnnualCost: number;
    employerCost: number;
    employeeCost: number;
    
    byCategory: {
      category: BenefitCategory;
      totalCost: number;
      employerCost: number;
      employeeCost: number;
    }[];
    
    perEmployeeAverage: {
      totalCost: number;
      employerCost: number;
      employeeCost: number;
    };
  };
  
  // Claims summary
  claimsSummary: {
    totalClaims: number;
    totalClaimedAmount: number;
    totalApprovedAmount: number;
    totalPaidAmount: number;
    
    averageProcessingDays: number;
    
    byStatus: {
      status: ClaimStatus;
      count: number;
      amount: number;
    }[];
  };
  
  // Dependent summary
  dependentSummary: {
    totalDependents: number;
    averageDependentsPerEmployee: number;
    
    byRelationship: {
      relationship: DependentType;
      count: number;
    }[];
  };
  
  // Vietnam specific
  socialInsuranceSummary?: {
    totalContributions: number;
    employerContributions: number;
    employeeContributions: number;
    activeRecords: number;
  };
}

export interface BenefitsCostProjection {
  year: number;
  
  projectedTotalCost: number;
  projectedEmployerCost: number;
  projectedEmployeeCost: number;
  
  growthRate: number;
  
  byCategory: {
    category: BenefitCategory;
    currentCost: number;
    projectedCost: number;
    growthRate: number;
  }[];
  
  assumptions: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateBenefitPlanDto {
  code: string;
  name: string;
  description?: string;
  category: BenefitCategory;
  type: BenefitType;
  providerId?: string;
  eligibilityRules: Partial<EligibilityRule>[];
  waitingPeriodDays: number;
  coverageOptions: Partial<CoverageOption>[];
  employerContribution: ContributionStructure;
  employeeContribution: ContributionStructure;
  effectiveDate: Date;
}

export interface CreateEnrollmentDto {
  employeeId: string;
  planId: string;
  enrollmentPeriodId?: string;
  coverageOptionId: string;
  dependentIds?: string[];
  lifeEventId?: string;
  effectiveDate: Date;
  beneficiaries?: Partial<Beneficiary>[];
}

export interface CreateDependentDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  relationship: DependentType;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationalId?: string;
  isFullTimeStudent?: boolean;
  isDisabled?: boolean;
}

export interface CreateClaimDto {
  enrollmentId: string;
  claimType: string;
  serviceDate: Date;
  claimedAmount: number;
  providerName?: string;
  dependentId?: string;
  description?: string;
  receiptUrls: string[];
}

export interface ProcessClaimDto {
  claimId: string;
  action: 'APPROVE' | 'PARTIALLY_APPROVE' | 'REJECT';
  approvedAmount?: number;
  rejectionReason?: string;
  notes?: string;
}

export interface CreateLifeEventDto {
  employeeId: string;
  type: LifeEventType;
  eventDate: Date;
  description?: string;
  documentUrls: string[];
}

export interface BenefitFilters {
  category?: BenefitCategory;
  type?: BenefitType;
  status?: string;
  providerId?: string;
}

export interface EnrollmentFilters {
  employeeId?: string;
  planId?: string;
  status?: EnrollmentStatus;
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
}

export interface ClaimFilters {
  employeeId?: string;
  planId?: string;
  status?: ClaimStatus;
  dateFrom?: Date;
  dateTo?: Date;
}
