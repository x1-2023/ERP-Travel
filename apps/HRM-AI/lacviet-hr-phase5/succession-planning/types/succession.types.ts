// succession-planning/types/succession.types.ts

/**
 * LAC VIET HR - Succession Planning Types
 * Enterprise talent management and succession system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum SuccessionPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  ARCHIVED = 'ARCHIVED',
}

export enum SuccessorReadiness {
  READY_NOW = 'READY_NOW',           // Can step in immediately
  READY_1_YEAR = 'READY_1_YEAR',     // Ready within 1 year
  READY_2_YEARS = 'READY_2_YEARS',   // Ready within 2 years
  READY_3_PLUS = 'READY_3_PLUS',     // 3+ years development needed
  NOT_READY = 'NOT_READY',           // Significant gaps
}

export enum TalentCategory {
  HIGH_POTENTIAL = 'HIGH_POTENTIAL',       // HiPo
  HIGH_PERFORMER = 'HIGH_PERFORMER',
  SOLID_PERFORMER = 'SOLID_PERFORMER',
  EMERGING_TALENT = 'EMERGING_TALENT',
  NEW_TO_ROLE = 'NEW_TO_ROLE',
  NEEDS_DEVELOPMENT = 'NEEDS_DEVELOPMENT',
  TRANSITIONING_OUT = 'TRANSITIONING_OUT',
}

export enum RiskLevel {
  CRITICAL = 'CRITICAL',             // High flight risk, critical role
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum FlightRisk {
  VERY_HIGH = 'VERY_HIGH',           // Actively looking / received offer
  HIGH = 'HIGH',                     // Showing signs
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  VERY_LOW = 'VERY_LOW',
}

export enum PositionCriticality {
  MISSION_CRITICAL = 'MISSION_CRITICAL',
  HIGHLY_IMPORTANT = 'HIGHLY_IMPORTANT',
  IMPORTANT = 'IMPORTANT',
  STANDARD = 'STANDARD',
}

export enum DevelopmentPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum DevelopmentActivityType {
  TRAINING = 'TRAINING',
  STRETCH_ASSIGNMENT = 'STRETCH_ASSIGNMENT',
  JOB_ROTATION = 'JOB_ROTATION',
  MENTORING = 'MENTORING',
  COACHING = 'COACHING',
  SHADOWING = 'SHADOWING',
  PROJECT_LEAD = 'PROJECT_LEAD',
  ACTING_ROLE = 'ACTING_ROLE',
  EXTERNAL_COURSE = 'EXTERNAL_COURSE',
  CERTIFICATION = 'CERTIFICATION',
  CONFERENCE = 'CONFERENCE',
  NETWORKING = 'NETWORKING',
}

export enum NineBoxPosition {
  HIGH_PERFORMER_HIGH_POTENTIAL = '9',     // Stars / Future Leaders
  HIGH_PERFORMER_MODERATE_POTENTIAL = '8', // High Professionals
  HIGH_PERFORMER_LIMITED_POTENTIAL = '7',  // Trusted Professionals
  MODERATE_PERFORMER_HIGH_POTENTIAL = '6', // Growth Employees
  MODERATE_PERFORMER_MODERATE_POTENTIAL = '5', // Core Players
  MODERATE_PERFORMER_LIMITED_POTENTIAL = '4',  // Effective
  LOW_PERFORMER_HIGH_POTENTIAL = '3',      // Inconsistent Players
  LOW_PERFORMER_MODERATE_POTENTIAL = '2',  // Up or Out
  LOW_PERFORMER_LIMITED_POTENTIAL = '1',   // Talent Risk
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRITICAL POSITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CriticalPosition {
  id: string;
  positionId: string;
  jobTitle: string;
  departmentId: string;
  departmentName: string;
  
  // Classification
  criticality: PositionCriticality;
  criticalityScore: number;          // 1-100
  criticalityFactors: CriticalityFactor[];
  
  // Current state
  currentIncumbentId?: string;
  currentIncumbent?: TalentProfile;
  isVacant: boolean;
  vacantSince?: Date;
  
  // Risk assessment
  incumbentFlightRisk?: FlightRisk;
  incumbentRetirementRisk?: number;  // Years to retirement
  vacancyRisk: RiskLevel;
  benchStrength: number;              // 0-100, based on successors
  
  // Succession
  successionPlanId?: string;
  successors: SuccessorCandidate[];
  readyNowCount: number;
  emergencySuccessorId?: string;
  
  // Requirements
  keyCompetencies: PositionCompetency[];
  keyExperiences: string[];
  minYearsExperience: number;
  requiredCertifications?: string[];
  
  // Market data
  timeToFillDays?: number;            // Average market time to fill
  externalAvailability: 'SCARCE' | 'LIMITED' | 'MODERATE' | 'ABUNDANT';
  
  // Review
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewedBy?: string;
  
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CriticalityFactor {
  factor: string;
  weight: number;
  score: number;
  notes?: string;
}

export interface PositionCompetency {
  competencyId: string;
  competencyName: string;
  requiredLevel: number;              // 1-5
  weight: number;                     // Importance weight
}

// ═══════════════════════════════════════════════════════════════════════════════
// TALENT PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

export interface TalentProfile {
  id: string;
  employeeId: string;
  
  // Basic info (denormalized for performance)
  employeeCode: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  currentPositionId: string;
  currentPositionTitle: string;
  departmentId: string;
  departmentName: string;
  managerId?: string;
  managerName?: string;
  hireDate: Date;
  yearsInCompany: number;
  yearsInRole: number;
  
  // Talent classification
  talentCategory: TalentCategory;
  nineBoxPosition: NineBoxPosition;
  performanceRating: number;          // Latest rating
  potentialRating: number;            // 1-3 (Low/Medium/High)
  
  // Risk
  flightRisk: FlightRisk;
  flightRiskFactors?: string[];
  retirementEligibleDate?: Date;
  yearsToRetirement?: number;
  
  // Retention
  retentionRisk: RiskLevel;
  retentionPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  retentionActions?: RetentionAction[];
  lastRetentionConversation?: Date;
  
  // Career
  careerAspirations: CareerAspiration[];
  mobilityPreference: MobilityPreference;
  promotionReadiness: SuccessorReadiness;
  lateralMoveInterest: boolean;
  relocationWillingness: boolean;
  willingToRelocateTo?: string[];
  
  // Competencies
  competencyProfile: CompetencyAssessment[];
  strengthAreas: string[];
  developmentAreas: string[];
  
  // Experience
  keyExperiences: KeyExperience[];
  criticalExperienceGaps: string[];
  
  // Education & Certifications
  highestEducation?: string;
  certifications: Certification[];
  languages: LanguageProficiency[];
  
  // Development
  developmentPlanId?: string;
  activeDevelopmentActivities: number;
  completedDevelopmentActivities: number;
  
  // Succession
  successorForPositions: string[];    // Position IDs this person is successor for
  successorReadinessMap: Map<string, SuccessorReadiness>;
  
  // Notes
  hrNotes?: string;
  managerNotes?: string;
  executiveNotes?: string;
  
  // Review
  lastTalentReviewDate?: Date;
  nextTalentReviewDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerAspiration {
  id: string;
  targetPositionId?: string;
  targetPositionTitle?: string;
  targetJobFamily?: string;
  targetLevel?: string;
  timeframe: '1_YEAR' | '2_3_YEARS' | '3_5_YEARS' | '5_PLUS_YEARS';
  priority: 1 | 2 | 3;
  notes?: string;
  addedDate: Date;
}

export interface MobilityPreference {
  geographicMobility: 'NONE' | 'LOCAL' | 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
  functionalMobility: 'NONE' | 'WITHIN_FAMILY' | 'ACROSS_FAMILIES';
  preferredLocations?: string[];
  excludedLocations?: string[];
  travelWillingness: number;          // % of time
  notes?: string;
}

export interface CompetencyAssessment {
  competencyId: string;
  competencyName: string;
  competencyCategory: string;
  
  currentLevel: number;               // 1-5
  targetLevel: number;
  gap: number;
  
  assessmentDate: Date;
  assessedBy: string;
  assessmentType: 'SELF' | 'MANAGER' | '360' | 'ASSESSMENT_CENTER';
  
  evidence?: string;
  developmentNotes?: string;
}

export interface KeyExperience {
  id: string;
  experienceType: string;             // P&L Management, International, M&A, etc.
  description: string;
  organizationId?: string;
  positionId?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  isActive: boolean;
}

export interface LanguageProficiency {
  language: string;
  speakingLevel: 'NATIVE' | 'FLUENT' | 'ADVANCED' | 'INTERMEDIATE' | 'BASIC';
  writingLevel: 'NATIVE' | 'FLUENT' | 'ADVANCED' | 'INTERMEDIATE' | 'BASIC';
  readingLevel: 'NATIVE' | 'FLUENT' | 'ADVANCED' | 'INTERMEDIATE' | 'BASIC';
}

export interface RetentionAction {
  id: string;
  actionType: string;
  description: string;
  plannedDate: Date;
  completedDate?: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  owner: string;
  cost?: number;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESSION PLAN
// ═══════════════════════════════════════════════════════════════════════════════

export interface SuccessionPlan {
  id: string;
  criticalPositionId: string;
  criticalPosition: CriticalPosition;
  
  name: string;
  description?: string;
  
  status: SuccessionPlanStatus;
  
  // Successors
  successors: SuccessorCandidate[];
  emergencySuccessorId?: string;
  
  // Target metrics
  targetReadyNowCount: number;        // How many ready-now successors needed
  targetBenchStrength: number;        // Target bench strength %
  
  // Current metrics
  currentReadyNowCount: number;
  currentBenchStrength: number;
  
  // Review cycle
  reviewFrequency: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewHistory: SuccessionReview[];
  
  // Approval
  approvedBy?: string;
  approvedDate?: Date;
  approvalComments?: string;
  
  // Ownership
  planOwnerId: string;                // Usually HR or position's manager
  hrPartnerId?: string;
  
  notes?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuccessorCandidate {
  id: string;
  successionPlanId: string;
  talentProfileId: string;
  talentProfile: TalentProfile;
  
  // Ranking
  rank: number;                       // 1 = primary successor
  isEmergencySuccessor: boolean;
  
  // Readiness
  readiness: SuccessorReadiness;
  readinessScore: number;             // 0-100
  readinessAssessmentDate: Date;
  
  // Fit analysis
  competencyFitScore: number;         // 0-100
  experienceFitScore: number;         // 0-100
  culturalFitScore: number;           // 0-100
  overallFitScore: number;            // Weighted average
  
  // Gaps
  competencyGaps: CompetencyGap[];
  experienceGaps: string[];
  
  // Development
  developmentPlanId?: string;
  developmentPlan?: DevelopmentPlan;
  developmentProgress: number;        // 0-100%
  
  // Timeline
  estimatedReadyDate?: Date;
  
  // Risk
  flightRisk: FlightRisk;
  acceptanceLikelihood: number;       // 0-100%
  
  // Notes
  assessmentNotes?: string;
  strengthsForRole?: string;
  concernsForRole?: string;
  
  // Status
  status: 'ACTIVE' | 'ON_TRACK' | 'AT_RISK' | 'REMOVED' | 'PLACED';
  removalReason?: string;
  placedDate?: Date;
  placedPositionId?: string;
  
  addedDate: Date;
  lastUpdated: Date;
}

export interface CompetencyGap {
  competencyId: string;
  competencyName: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  priority: DevelopmentPriority;
  closingActions: string[];
}

export interface SuccessionReview {
  id: string;
  planId: string;
  
  reviewDate: Date;
  reviewType: 'SCHEDULED' | 'AD_HOC' | 'TRIGGERED';
  
  participants: string[];
  
  // Metrics at time of review
  benchStrengthAtReview: number;
  readyNowCountAtReview: number;
  
  // Changes made
  candidatesAdded: string[];
  candidatesRemoved: string[];
  readinessChanges: {
    candidateId: string;
    fromReadiness: SuccessorReadiness;
    toReadiness: SuccessorReadiness;
  }[];
  
  // Decisions
  decisions: string[];
  actionItems: ReviewActionItem[];
  
  notes?: string;
  
  createdBy: string;
  createdAt: Date;
}

export interface ReviewActionItem {
  id: string;
  action: string;
  owner: string;
  dueDate: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedDate?: Date;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPMENT PLAN
// ═══════════════════════════════════════════════════════════════════════════════

export interface DevelopmentPlan {
  id: string;
  talentProfileId: string;
  talentProfile: TalentProfile;
  
  name: string;
  description?: string;
  
  // Target
  targetPositionId?: string;
  targetPositionTitle?: string;
  targetReadiness: SuccessorReadiness;
  targetDate?: Date;
  
  // Activities
  activities: DevelopmentActivity[];
  
  // Progress
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  overallProgress: number;            // 0-100%
  
  // Competency progress
  competencyProgress: {
    competencyId: string;
    competencyName: string;
    startingLevel: number;
    currentLevel: number;
    targetLevel: number;
    progress: number;
  }[];
  
  // Status
  status: 'DRAFT' | 'ACTIVE' | 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
  
  // Review
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL';
  
  // Stakeholders
  planOwnerId: string;                // Usually the employee
  managerId: string;
  hrPartnerId?: string;
  mentorId?: string;
  
  // Budget
  budgetAllocated?: number;
  budgetUsed?: number;
  
  notes?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevelopmentActivity {
  id: string;
  developmentPlanId: string;
  
  name: string;
  description?: string;
  
  type: DevelopmentActivityType;
  category: 'COMPETENCY' | 'EXPERIENCE' | 'EXPOSURE' | 'EDUCATION';
  
  // Targets
  targetCompetencies: string[];
  targetExperiences: string[];
  
  // Timeline
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Status
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'CANCELLED';
  progress: number;                   // 0-100%
  
  // Details based on type
  activityDetails: ActivityDetails;
  
  // Outcome
  expectedOutcome?: string;
  actualOutcome?: string;
  successMeasure?: string;
  
  // Resources
  cost?: number;
  timeInvestmentHours?: number;
  
  // Support
  ownerId: string;                    // Usually the employee
  supporterId?: string;               // Manager, mentor, etc.
  
  // Feedback
  feedbackNotes?: string;
  rating?: number;                    // 1-5
  
  priority: DevelopmentPriority;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDetails {
  // Training
  trainingId?: string;
  trainingProvider?: string;
  courseUrl?: string;
  
  // Stretch assignment / Project
  projectId?: string;
  projectName?: string;
  projectRole?: string;
  
  // Job rotation
  rotationDepartmentId?: string;
  rotationPositionId?: string;
  rotationDuration?: number;          // months
  
  // Mentoring / Coaching
  mentorId?: string;
  coachId?: string;
  sessionFrequency?: string;
  totalSessions?: number;
  completedSessions?: number;
  
  // Shadowing
  shadoweeId?: string;
  shadowDuration?: number;            // days
  
  // Acting role
  actingPositionId?: string;
  actingStartDate?: Date;
  actingEndDate?: Date;
  
  // Certification
  certificationName?: string;
  certificationProvider?: string;
  examDate?: Date;
  passed?: boolean;
  
  // Conference
  conferenceName?: string;
  conferenceLocation?: string;
  conferenceDate?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TALENT POOL
// ═══════════════════════════════════════════════════════════════════════════════

export interface TalentPool {
  id: string;
  name: string;
  description?: string;
  
  type: 'LEADERSHIP' | 'FUNCTIONAL' | 'CRITICAL_SKILL' | 'EMERGING' | 'CUSTOM';
  
  // Criteria
  criteria: TalentPoolCriteria;
  
  // Members
  members: TalentPoolMember[];
  memberCount: number;
  
  // Target
  targetSize?: number;
  
  // Ownership
  poolOwnerId: string;
  hrPartnerId?: string;
  
  // Review
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  reviewFrequency: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  
  isActive: boolean;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TalentPoolCriteria {
  // Performance
  minPerformanceRating?: number;
  minPotentialRating?: number;
  minNineBoxPosition?: NineBoxPosition;
  
  // Experience
  minYearsInCompany?: number;
  maxYearsInCompany?: number;
  minYearsInRole?: number;
  
  // Demographics
  departmentIds?: string[];
  jobFamilyIds?: string[];
  gradeIds?: string[];
  locationIds?: string[];
  
  // Talent category
  talentCategories?: TalentCategory[];
  
  // Competencies
  requiredCompetencies?: {
    competencyId: string;
    minLevel: number;
  }[];
  
  // Custom
  customCriteria?: Record<string, unknown>;
}

export interface TalentPoolMember {
  id: string;
  poolId: string;
  talentProfileId: string;
  talentProfile: TalentProfile;
  
  // Membership
  addedDate: Date;
  addedBy: string;
  addedReason?: string;
  
  // Status
  status: 'ACTIVE' | 'GRADUATED' | 'EXITED' | 'ON_HOLD';
  statusChangeDate?: Date;
  statusChangeReason?: string;
  
  // Progress in pool
  entryNineBoxPosition: NineBoxPosition;
  currentNineBoxPosition: NineBoxPosition;
  progressNotes?: string;
  
  // Outcome
  graduatedToPositionId?: string;
  graduatedDate?: Date;
  exitReason?: string;
  exitDate?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NINE BOX GRID
// ═══════════════════════════════════════════════════════════════════════════════

export interface NineBoxGrid {
  id: string;
  name: string;
  description?: string;
  
  // Configuration
  performanceAxis: NineBoxAxis;
  potentialAxis: NineBoxAxis;
  
  // Box definitions
  boxes: NineBoxDefinition[];
  
  // Snapshot
  asOfDate: Date;
  employeePlacements: NineBoxPlacement[];
  
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NineBoxAxis {
  name: string;                       // "Performance" or "Potential"
  lowLabel: string;                   // "Low" or custom
  mediumLabel: string;                // "Medium" or custom
  highLabel: string;                  // "High" or custom
  
  // Thresholds
  lowThreshold: number;               // Below this = Low
  highThreshold: number;              // Above this = High
}

export interface NineBoxDefinition {
  position: NineBoxPosition;
  name: string;
  description: string;
  color: string;
  
  // Recommended actions
  recommendedActions: string[];
  developmentFocus: string[];
  
  // Metrics guidance
  typicalMeritIncrease?: string;
  bonusEligibility?: string;
  promotionTimeline?: string;
}

export interface NineBoxPlacement {
  id: string;
  gridId: string;
  talentProfileId: string;
  
  position: NineBoxPosition;
  
  performanceScore: number;
  potentialScore: number;
  
  // Change from previous
  previousPosition?: NineBoxPosition;
  positionChanged: boolean;
  
  placedBy: string;
  placedDate: Date;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface SuccessionAnalytics {
  asOfDate: Date;
  
  // Critical positions overview
  criticalPositions: {
    total: number;
    byCategory: {
      criticality: PositionCriticality;
      count: number;
    }[];
    withSuccessors: number;
    withoutSuccessors: number;
    withReadyNow: number;
    avgBenchStrength: number;
  };
  
  // Succession health
  successionHealth: {
    healthScore: number;              // 0-100
    readyNowCoverage: number;         // % of critical positions with ready-now
    pipelineCoverage: number;         // % with any successor
    avgSuccessorsPerPosition: number;
    atRiskPositions: number;
  };
  
  // Talent distribution
  talentDistribution: {
    byNineBox: {
      position: NineBoxPosition;
      count: number;
      percentage: number;
    }[];
    byCategory: {
      category: TalentCategory;
      count: number;
      percentage: number;
    }[];
    byDepartment: {
      departmentId: string;
      departmentName: string;
      totalEmployees: number;
      highPotentials: number;
      highPerformers: number;
    }[];
  };
  
  // Risk analysis
  riskAnalysis: {
    flightRisk: {
      level: FlightRisk;
      count: number;
      criticalRoles: number;
    }[];
    retirementRisk: {
      years: string;                  // '0-1', '1-2', '2-3', '3-5', '5+'
      count: number;
      criticalRoles: number;
    }[];
    singlePointsOfFailure: number;    // Positions with no successor
    keyPersonDependency: number;
  };
  
  // Development progress
  developmentProgress: {
    activePlans: number;
    completedPlans: number;
    avgPlanProgress: number;
    activitiesCompleted: number;
    activitiesInProgress: number;
  };
  
  // Movement
  talentMovement: {
    promotions: number;
    lateralMoves: number;
    successionsExecuted: number;
    externalHires: number;
    regrettableLosses: number;
  };
}

export interface SuccessionDashboardData {
  summary: {
    criticalPositionsCount: number;
    criticalPositionsWithSuccessors: number;
    readyNowSuccessors: number;
    avgBenchStrength: number;
    highPotentialsCount: number;
    atRiskPositions: number;
  };
  
  criticalPositionsList: {
    id: string;
    title: string;
    department: string;
    incumbent: string;
    benchStrength: number;
    readyNow: number;
    totalSuccessors: number;
    riskLevel: RiskLevel;
  }[];
  
  readinessMatrix: {
    readiness: SuccessorReadiness;
    count: number;
    positions: string[];
  }[];
  
  recentChanges: {
    type: 'SUCCESSION_EXECUTED' | 'SUCCESSOR_ADDED' | 'READINESS_CHANGED' | 'POSITION_ADDED';
    description: string;
    date: Date;
    actor: string;
  }[];
  
  upcomingReviews: {
    planId: string;
    positionTitle: string;
    reviewDate: Date;
    owner: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateCriticalPositionDto {
  positionId: string;
  criticality: PositionCriticality;
  criticalityFactors: CriticalityFactor[];
  keyCompetencies: PositionCompetency[];
  keyExperiences: string[];
  minYearsExperience: number;
  notes?: string;
}

export interface CreateSuccessionPlanDto {
  criticalPositionId: string;
  name: string;
  description?: string;
  targetReadyNowCount: number;
  targetBenchStrength: number;
  reviewFrequency: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  planOwnerId: string;
  hrPartnerId?: string;
}

export interface AddSuccessorDto {
  successionPlanId: string;
  talentProfileId: string;
  readiness: SuccessorReadiness;
  isEmergencySuccessor: boolean;
  assessmentNotes?: string;
}

export interface UpdateTalentProfileDto {
  talentCategory?: TalentCategory;
  performanceRating?: number;
  potentialRating?: number;
  flightRisk?: FlightRisk;
  careerAspirations?: CareerAspiration[];
  mobilityPreference?: MobilityPreference;
  notes?: string;
}

export interface CreateDevelopmentPlanDto {
  talentProfileId: string;
  name: string;
  description?: string;
  targetPositionId?: string;
  targetReadiness: SuccessorReadiness;
  targetDate?: Date;
  reviewFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL';
  mentorId?: string;
  budgetAllocated?: number;
}

export interface AddDevelopmentActivityDto {
  developmentPlanId: string;
  name: string;
  description?: string;
  type: DevelopmentActivityType;
  category: 'COMPETENCY' | 'EXPERIENCE' | 'EXPOSURE' | 'EDUCATION';
  targetCompetencies: string[];
  plannedStartDate: Date;
  plannedEndDate: Date;
  priority: DevelopmentPriority;
  activityDetails: ActivityDetails;
}

export interface NineBoxAssessmentDto {
  employeeId: string;
  performanceScore: number;
  potentialScore: number;
  notes?: string;
}

export interface TalentPoolFilters {
  type?: string;
  status?: string;
  poolOwnerId?: string;
}

export interface TalentSearchFilters {
  departmentIds?: string[];
  nineBoxPositions?: NineBoxPosition[];
  talentCategories?: TalentCategory[];
  minPerformanceRating?: number;
  minPotentialRating?: number;
  flightRiskLevels?: FlightRisk[];
  searchTerm?: string;
}
