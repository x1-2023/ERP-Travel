// job-marketplace/types/marketplace.types.ts

/**
 * LAC VIET HR - Internal Job Marketplace Types
 * Internal mobility and career opportunities system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum JobPostingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  ON_HOLD = 'ON_HOLD',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum JobType {
  PERMANENT_TRANSFER = 'PERMANENT_TRANSFER',
  TEMPORARY_ASSIGNMENT = 'TEMPORARY_ASSIGNMENT',
  JOB_ROTATION = 'JOB_ROTATION',
  PROJECT_OPPORTUNITY = 'PROJECT_OPPORTUNITY',
  STRETCH_ASSIGNMENT = 'STRETCH_ASSIGNMENT',
  MENTORSHIP = 'MENTORSHIP',
  SHADOW_OPPORTUNITY = 'SHADOW_OPPORTUNITY',
  GIG = 'GIG',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  MANAGER_APPROVED = 'MANAGER_APPROVED',
  HR_APPROVED = 'HR_APPROVED',
  OFFER_PENDING = 'OFFER_PENDING',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  WITHDRAWN = 'WITHDRAWN',
  REJECTED = 'REJECTED',
}

export enum MobilityPreference {
  LATERAL_ONLY = 'LATERAL_ONLY',
  UPWARD_ONLY = 'UPWARD_ONLY',
  BOTH = 'BOTH',
  DOWNWARD_ACCEPTED = 'DOWNWARD_ACCEPTED',
}

export enum RelocationWillingness {
  NOT_WILLING = 'NOT_WILLING',
  SAME_CITY = 'SAME_CITY',
  SAME_REGION = 'SAME_REGION',
  NATIONWIDE = 'NATIONWIDE',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum SkillMatchLevel {
  EXCEEDS = 'EXCEEDS',
  MEETS = 'MEETS',
  PARTIAL = 'PARTIAL',
  DEVELOPING = 'DEVELOPING',
  GAP = 'GAP',
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOB POSTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface InternalJobPosting {
  id: string;
  code: string;
  
  // Basic info
  title: string;
  description: string;
  jobType: JobType;
  
  // Department & Location
  departmentId: string;
  departmentName: string;
  locationId?: string;
  locationName?: string;
  
  // Position details
  positionId?: string;
  gradeId?: string;
  gradeName?: string;
  reportingToId?: string;
  reportingToName?: string;
  
  // Requirements
  requirements: JobRequirement[];
  preferredSkills: string[];
  minExperienceYears?: number;
  educationLevel?: string;
  
  // Compensation (if different from current)
  showCompensation: boolean;
  compensationRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Assignment details (for temporary)
  isTemporary: boolean;
  durationMonths?: number;
  startDate?: Date;
  endDate?: Date;
  percentageTime?: number;         // For part-time assignments
  
  // Eligibility
  eligibilityCriteria: EligibilityCriteria;
  
  // Status
  status: JobPostingStatus;
  
  // Dates
  postedDate?: Date;
  applicationDeadline?: Date;
  targetFillDate?: Date;
  
  // Approval
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Stats
  viewCount: number;
  applicationCount: number;
  bookmarkCount: number;
  
  // Hiring team
  hiringManagerId: string;
  hiringManagerName: string;
  hrPartnerId?: string;
  interviewerIds: string[];
  
  // Visibility
  visibility: 'ALL' | 'DEPARTMENT' | 'DIVISION' | 'CUSTOM';
  visibleToDepartmentIds?: string[];
  
  // Tags
  tags: string[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobRequirement {
  id: string;
  type: 'SKILL' | 'COMPETENCY' | 'CERTIFICATION' | 'EXPERIENCE' | 'EDUCATION';
  name: string;
  description?: string;
  level?: number;                  // 1-5 for skills/competencies
  isRequired: boolean;
  weight: number;                  // For matching score
}

export interface EligibilityCriteria {
  minTenureMonths?: number;
  maxTenureMonths?: number;
  performanceRatingMin?: number;
  allowedGradeIds?: string[];
  allowedDepartmentIds?: string[];
  excludedEmployeeIds?: string[];
  requiresManagerApproval: boolean;
  requiresCurrentRoleTenure?: number; // Min months in current role
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface JobApplication {
  id: string;
  applicationCode: string;
  
  jobPostingId: string;
  jobPosting?: InternalJobPosting;
  
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  currentDepartment: string;
  currentPosition: string;
  
  status: ApplicationStatus;
  statusHistory: ApplicationStatusHistory[];
  
  // Application content
  coverLetter?: string;
  motivationStatement?: string;
  
  // Skill match
  skillMatchScore: number;         // 0-100
  skillMatches: SkillMatch[];
  
  // Fit assessment
  overallFitScore?: number;
  assessmentNotes?: string;
  
  // Manager approval
  currentManagerId?: string;
  currentManagerApproval?: 'PENDING' | 'APPROVED' | 'DECLINED';
  currentManagerComments?: string;
  currentManagerApprovedAt?: Date;
  
  // Interviews
  interviews: Interview[];
  
  // Offer
  offerDetails?: OfferDetails;
  
  // Final decision
  finalDecision?: 'SELECTED' | 'NOT_SELECTED' | 'WITHDRAWN';
  decisionDate?: Date;
  decisionBy?: string;
  decisionReason?: string;
  
  // Dates
  appliedAt: Date;
  lastActivityAt: Date;
  
  // Withdrawal
  withdrawnAt?: Date;
  withdrawalReason?: string;
}

export interface ApplicationStatusHistory {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string;
  notes?: string;
}

export interface SkillMatch {
  requirementId: string;
  requirementName: string;
  requirementType: string;
  requiredLevel?: number;
  applicantLevel?: number;
  matchLevel: SkillMatchLevel;
  score: number;                   // 0-100
  notes?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'PANEL';
  round: number;
  
  scheduledAt: Date;
  duration: number;                // minutes
  location?: string;
  meetingLink?: string;
  
  interviewerIds: string[];
  interviewerNames: string[];
  
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  
  // Feedback
  feedback?: InterviewFeedback[];
  overallRating?: number;          // 1-5
  recommendation?: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  
  completedAt?: Date;
  notes?: string;
}

export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  
  ratings: {
    category: string;
    rating: number;                // 1-5
    comments?: string;
  }[];
  
  overallRating: number;
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  strengths: string[];
  concerns: string[];
  additionalComments?: string;
  
  submittedAt: Date;
}

export interface OfferDetails {
  id: string;
  applicationId: string;
  
  newPositionId?: string;
  newPositionTitle: string;
  newDepartmentId: string;
  newDepartmentName: string;
  newGradeId?: string;
  newReportingToId?: string;
  
  // Compensation
  newBaseSalary?: number;
  salaryChangePercent?: number;
  bonusTarget?: number;
  
  // Timing
  proposedStartDate: Date;
  transitionPeriodDays?: number;
  
  // For temporary assignments
  assignmentEndDate?: Date;
  returnGuarantee?: boolean;
  
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  
  sentAt?: Date;
  respondedAt?: Date;
  expiresAt?: Date;
  
  declineReason?: string;
  
  createdBy: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAREER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CareerProfile {
  id: string;
  employeeId: string;
  
  // Career interests
  careerGoals: string[];
  targetRoles: TargetRole[];
  
  // Preferences
  mobilityPreference: MobilityPreference;
  relocationWillingness: RelocationWillingness;
  preferredLocations?: string[];
  
  // Availability
  openToOpportunities: boolean;
  availableFrom?: Date;
  
  // Job types of interest
  interestedJobTypes: JobType[];
  
  // Skills
  skills: ProfileSkill[];
  
  // Experiences
  keyExperiences: string[];
  projectHighlights: ProjectHighlight[];
  
  // Development
  learningInterests: string[];
  certificationGoals: string[];
  
  // Resume
  internalResumeUrl?: string;
  lastResumeUpdate?: Date;
  
  // Bookmarks
  bookmarkedJobIds: string[];
  
  // Activity
  lastActiveAt: Date;
  profileCompleteness: number;     // 0-100
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetRole {
  id: string;
  roleTitle: string;
  jobFamilyId?: string;
  gradeId?: string;
  timeframe: '0-1_YEAR' | '1-2_YEARS' | '2-5_YEARS' | '5_PLUS_YEARS';
  priority: number;
  notes?: string;
}

export interface ProfileSkill {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiencyLevel: number;        // 1-5
  yearsOfExperience?: number;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  endorsements: number;
}

export interface ProjectHighlight {
  id: string;
  title: string;
  description: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  skills: string[];
  impact?: string;
  isPublic: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface JobMatch {
  jobPostingId: string;
  jobPosting: InternalJobPosting;
  employeeId: string;
  
  matchScore: number;              // 0-100
  
  skillMatchScore: number;
  experienceMatchScore: number;
  preferenceMatchScore: number;
  
  skillMatches: SkillMatch[];
  
  matchReasons: string[];
  gapAreas: string[];
  
  // Ranking
  rank: number;
  
  calculatedAt: Date;
}

export interface TalentMatch {
  employeeId: string;
  employeeName: string;
  currentPosition: string;
  currentDepartment: string;
  
  matchScore: number;
  skillMatchScore: number;
  
  profileSummary: {
    yearsInCompany: number;
    performanceRating?: number;
    skillHighlights: string[];
    openToOpportunities: boolean;
  };
  
  matchReasons: string[];
  potentialConcerns: string[];
  
  rank: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MarketplaceAnalytics {
  asOfDate: Date;
  
  // Posting stats
  postingStats: {
    totalActive: number;
    totalThisMonth: number;
    byJobType: { type: JobType; count: number }[];
    byDepartment: { departmentId: string; departmentName: string; count: number }[];
    avgTimeToFill: number;
    fillRate: number;
  };
  
  // Application stats
  applicationStats: {
    totalApplications: number;
    applicationsThisMonth: number;
    avgApplicationsPerPosting: number;
    byStatus: { status: ApplicationStatus; count: number }[];
    conversionRate: number;         // Applications to offers
  };
  
  // Mobility stats
  mobilityStats: {
    totalMoves: number;
    movesThisYear: number;
    internalHireRate: number;       // vs external
    byMoveType: { type: string; count: number }[];
    avgTenureBeforeMove: number;
    retentionAfterMove: number;
  };
  
  // Engagement
  engagementStats: {
    activeProfiles: number;
    profileCompletionRate: number;
    avgBookmarksPerEmployee: number;
    employeesOpenToOpportunities: number;
  };
  
  // Trends
  trends: {
    postingsTrend: { month: string; count: number }[];
    applicationsTrend: { month: string; count: number }[];
    movesTrend: { month: string; count: number }[];
  };
}

export interface MarketplaceDashboard {
  // For employees
  employeeView: {
    recommendedJobs: JobMatch[];
    recentApplications: JobApplication[];
    bookmarkedJobs: InternalJobPosting[];
    profileCompleteness: number;
    suggestedSkills: string[];
  };
  
  // For hiring managers
  managerView: {
    myPostings: InternalJobPosting[];
    pendingApplications: JobApplication[];
    scheduledInterviews: Interview[];
    teamMembersOpenToMove: number;
  };
  
  // For HR
  hrView: {
    analytics: MarketplaceAnalytics;
    pendingApprovals: InternalJobPosting[];
    recentMoves: { employeeName: string; fromRole: string; toRole: string; date: Date }[];
    atRiskOfLeaving: { employeeId: string; employeeName: string; riskScore: number }[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateJobPostingDto {
  title: string;
  description: string;
  jobType: JobType;
  departmentId: string;
  locationId?: string;
  positionId?: string;
  gradeId?: string;
  requirements: Omit<JobRequirement, 'id'>[];
  preferredSkills?: string[];
  minExperienceYears?: number;
  isTemporary: boolean;
  durationMonths?: number;
  applicationDeadline?: Date;
  eligibilityCriteria: EligibilityCriteria;
  visibility: 'ALL' | 'DEPARTMENT' | 'DIVISION' | 'CUSTOM';
  visibleToDepartmentIds?: string[];
}

export interface SubmitApplicationDto {
  jobPostingId: string;
  coverLetter?: string;
  motivationStatement?: string;
}

export interface UpdateCareerProfileDto {
  careerGoals?: string[];
  targetRoles?: Omit<TargetRole, 'id'>[];
  mobilityPreference?: MobilityPreference;
  relocationWillingness?: RelocationWillingness;
  preferredLocations?: string[];
  openToOpportunities?: boolean;
  interestedJobTypes?: JobType[];
  skills?: Omit<ProfileSkill, 'id' | 'isVerified' | 'verifiedBy' | 'verifiedAt' | 'endorsements'>[];
}

export interface ScheduleInterviewDto {
  applicationId: string;
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'PANEL';
  round: number;
  scheduledAt: Date;
  duration: number;
  interviewerIds: string[];
  location?: string;
  meetingLink?: string;
}

export interface SubmitInterviewFeedbackDto {
  interviewId: string;
  ratings: { category: string; rating: number; comments?: string }[];
  overallRating: number;
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  strengths: string[];
  concerns: string[];
  additionalComments?: string;
}

export interface CreateOfferDto {
  applicationId: string;
  newPositionTitle: string;
  newDepartmentId: string;
  newGradeId?: string;
  newBaseSalary?: number;
  proposedStartDate: Date;
  transitionPeriodDays?: number;
  assignmentEndDate?: Date;
}

export interface JobPostingFilters {
  status?: JobPostingStatus;
  jobType?: JobType;
  departmentId?: string;
  locationId?: string;
  gradeId?: string;
  searchTerm?: string;
}

export interface ApplicationFilters {
  jobPostingId?: string;
  applicantId?: string;
  status?: ApplicationStatus;
  hiringManagerId?: string;
}
