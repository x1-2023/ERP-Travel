// employee-engagement/types/engagement.types.ts

/**
 * LAC VIET HR - Employee Engagement Types
 * Surveys, pulse checks, feedback, and engagement analytics
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export enum SurveyType {
  ENGAGEMENT = 'ENGAGEMENT',           // Annual/Semi-annual engagement survey
  PULSE = 'PULSE',                     // Quick pulse check
  ONBOARDING = 'ONBOARDING',           // New hire experience
  EXIT = 'EXIT',                       // Exit interview
  ENPS = 'ENPS',                       // Employee Net Promoter Score
  CUSTOM = 'CUSTOM',                   // Custom survey
  PERFORMANCE_FEEDBACK = 'PERFORMANCE_FEEDBACK',
  MANAGER_EFFECTIVENESS = 'MANAGER_EFFECTIVENESS',
  CULTURE = 'CULTURE',
  WELLBEING = 'WELLBEING',
  DIVERSITY_INCLUSION = 'DIVERSITY_INCLUSION',
  TRAINING_FEEDBACK = 'TRAINING_FEEDBACK',
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RATING_SCALE = 'RATING_SCALE',       // 1-5, 1-10
  LIKERT = 'LIKERT',                   // Strongly Disagree to Strongly Agree
  TEXT_SHORT = 'TEXT_SHORT',
  TEXT_LONG = 'TEXT_LONG',
  NPS = 'NPS',                         // 0-10 Net Promoter Score
  RANKING = 'RANKING',
  MATRIX = 'MATRIX',
  DATE = 'DATE',
  YES_NO = 'YES_NO',
  SLIDER = 'SLIDER',
}

export enum ResponseStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum FeedbackType {
  RECOGNITION = 'RECOGNITION',         // Kudos, praise
  SUGGESTION = 'SUGGESTION',           // Improvement ideas
  CONCERN = 'CONCERN',                 // Issues to address
  QUESTION = 'QUESTION',               // Questions for leadership
  GENERAL = 'GENERAL',
}

export enum FeedbackVisibility {
  PUBLIC = 'PUBLIC',                   // Visible to everyone
  TEAM = 'TEAM',                       // Visible to team
  MANAGER = 'MANAGER',                 // Visible to manager only
  HR = 'HR',                           // Visible to HR only
  ANONYMOUS = 'ANONYMOUS',             // Anonymous submission
}

export enum ActionItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DEFERRED = 'DEFERRED',
}

export enum ActionItemPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum EngagementDimension {
  OVERALL_ENGAGEMENT = 'OVERALL_ENGAGEMENT',
  LEADERSHIP = 'LEADERSHIP',
  COMMUNICATION = 'COMMUNICATION',
  CAREER_DEVELOPMENT = 'CAREER_DEVELOPMENT',
  COMPENSATION_BENEFITS = 'COMPENSATION_BENEFITS',
  WORK_LIFE_BALANCE = 'WORK_LIFE_BALANCE',
  RECOGNITION = 'RECOGNITION',
  TEAM_COLLABORATION = 'TEAM_COLLABORATION',
  MANAGER_RELATIONSHIP = 'MANAGER_RELATIONSHIP',
  JOB_SATISFACTION = 'JOB_SATISFACTION',
  COMPANY_CULTURE = 'COMPANY_CULTURE',
  INNOVATION = 'INNOVATION',
  DIVERSITY_INCLUSION = 'DIVERSITY_INCLUSION',
  WELLBEING = 'WELLBEING',
  TOOLS_RESOURCES = 'TOOLS_RESOURCES',
}

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEYS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Survey {
  id: string;
  title: string;
  description?: string;
  
  type: SurveyType;
  status: SurveyStatus;
  
  // Structure
  sections: SurveySection[];
  totalQuestions: number;
  estimatedMinutes: number;
  
  // Schedule
  startDate: Date;
  endDate: Date;
  reminderDays: number[];            // Days before end to remind
  
  // Audience
  audienceType: 'ALL' | 'DEPARTMENT' | 'LOCATION' | 'CUSTOM';
  audienceDepartmentIds?: string[];
  audienceLocationIds?: string[];
  audienceEmployeeIds?: string[];
  excludedEmployeeIds?: string[];
  
  // Settings
  isAnonymous: boolean;
  allowPartialSubmission: boolean;
  showProgressBar: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  
  // Branding
  logoUrl?: string;
  primaryColor?: string;
  
  // Messages
  welcomeMessage?: string;
  thankYouMessage?: string;
  
  // Response tracking
  totalInvited: number;
  totalStarted: number;
  totalCompleted: number;
  responseRate: number;
  
  // Analysis
  benchmarkId?: string;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  closedAt?: Date;
}

export interface SurveySection {
  id: string;
  surveyId: string;
  
  title: string;
  description?: string;
  
  dimension?: EngagementDimension;
  
  order: number;
  questions: SurveyQuestion[];
  
  // Conditional display
  displayCondition?: DisplayCondition;
  
  isRequired: boolean;
}

export interface SurveyQuestion {
  id: string;
  sectionId: string;
  
  text: string;
  description?: string;
  
  type: QuestionType;
  dimension?: EngagementDimension;
  
  order: number;
  
  // Options for choice questions
  options?: QuestionOption[];
  
  // Settings for rating/scale questions
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  
  // For matrix questions
  matrixRows?: string[];
  matrixColumns?: string[];
  
  // Validation
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  
  // Conditional display
  displayCondition?: DisplayCondition;
  
  // Scoring
  isScored: boolean;
  maxScore?: number;
  scoringRules?: ScoringRule[];
  
  // Benchmark
  benchmarkValue?: number;
  industryBenchmark?: number;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  
  text: string;
  value: string | number;
  
  order: number;
  
  // Scoring
  score?: number;
  
  // Conditional logic
  triggersQuestion?: string;         // Question ID to show if selected
  
  isOther: boolean;                  // "Other" option with text input
}

export interface DisplayCondition {
  questionId: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN';
  value: string | number | string[];
}

export interface ScoringRule {
  optionValue: string | number;
  score: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SurveyResponse {
  id: string;
  surveyId: string;
  
  // Respondent (null if anonymous)
  employeeId?: string;
  respondentToken: string;           // Unique token for anonymous tracking
  
  // Status
  status: ResponseStatus;
  
  // Progress
  currentSectionIndex: number;
  currentQuestionIndex: number;
  completionPercentage: number;
  
  // Answers
  answers: QuestionAnswer[];
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  totalTimeSeconds?: number;
  
  // Device info
  deviceType?: string;
  browser?: string;
  ipAddress?: string;
  
  // Scores (calculated after completion)
  overallScore?: number;
  dimensionScores?: DimensionScore[];
  enpsScore?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionAnswer {
  id: string;
  responseId: string;
  questionId: string;
  
  // Answer value (depends on question type)
  selectedOptionIds?: string[];      // For choice questions
  textValue?: string;                // For text questions
  numericValue?: number;             // For rating/scale/NPS
  dateValue?: Date;                  // For date questions
  rankingValue?: string[];           // For ranking questions
  matrixValue?: Record<string, string | number>; // For matrix questions
  
  // Scoring
  score?: number;
  maxScore?: number;
  
  // Timing
  answeredAt: Date;
  timeSpentSeconds?: number;
}

export interface DimensionScore {
  dimension: EngagementDimension;
  score: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
  benchmark?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK & RECOGNITION
// ═══════════════════════════════════════════════════════════════════════════════

export interface Feedback {
  id: string;
  
  type: FeedbackType;
  visibility: FeedbackVisibility;
  
  // Sender (null if anonymous)
  senderId?: string;
  senderName?: string;
  isAnonymous: boolean;
  
  // Recipient
  recipientType: 'EMPLOYEE' | 'TEAM' | 'DEPARTMENT' | 'COMPANY';
  recipientId?: string;
  recipientName?: string;
  
  // Content
  title?: string;
  content: string;
  
  // For recognition
  recognitionValue?: string;         // Company value recognized
  badgeId?: string;
  points?: number;
  
  // Attachments
  attachmentUrls?: string[];
  
  // Reactions
  reactions: FeedbackReaction[];
  reactionCount: number;
  
  // Comments
  comments: FeedbackComment[];
  commentCount: number;
  
  // Status
  status: 'ACTIVE' | 'HIDDEN' | 'FLAGGED' | 'DELETED';
  
  // Moderation
  isFlagged: boolean;
  flagReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackReaction {
  id: string;
  feedbackId: string;
  employeeId: string;
  reactionType: string;              // 'LIKE', 'LOVE', 'CELEBRATE', etc.
  createdAt: Date;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  
  authorId?: string;
  authorName?: string;
  isAnonymous: boolean;
  
  content: string;
  
  parentCommentId?: string;          // For replies
  
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RecognitionBadge {
  id: string;
  name: string;
  description?: string;
  
  imageUrl: string;
  
  // Association
  companyValueId?: string;
  companyValueName?: string;
  
  // Points
  pointsAwarded: number;
  
  // Limits
  maxAwardsPerPeriod?: number;
  periodType?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  
  // Eligibility
  canGiveToPeers: boolean;
  canGiveToManagers: boolean;
  canGiveToReports: boolean;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PULSE CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PulseCheck {
  id: string;
  name: string;
  
  // Schedule
  frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  dayOfWeek?: number;                // 0-6 for weekly
  dayOfMonth?: number;               // 1-31 for monthly
  timeOfDay: string;                 // HH:mm format
  timezone: string;
  
  // Questions (typically 1-5)
  questions: PulseQuestion[];
  
  // Audience
  audienceType: 'ALL' | 'DEPARTMENT' | 'SAMPLE';
  audienceDepartmentIds?: string[];
  samplePercentage?: number;
  
  // Status
  isActive: boolean;
  
  // History
  checkInstances: PulseCheckInstance[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PulseQuestion {
  id: string;
  pulseCheckId: string;
  
  text: string;
  type: 'MOOD' | 'SCALE' | 'YES_NO' | 'TEXT';
  
  // For mood
  moodOptions?: string[];            // ['😞', '😐', '😊', '😄', '🤩']
  
  // For scale
  scaleMin?: number;
  scaleMax?: number;
  
  dimension?: EngagementDimension;
  
  order: number;
  isRequired: boolean;
}

export interface PulseCheckInstance {
  id: string;
  pulseCheckId: string;
  
  scheduledDate: Date;
  sentDate?: Date;
  closedDate?: Date;
  
  // Recipients
  recipientCount: number;
  responseCount: number;
  responseRate: number;
  
  // Results
  results: PulseResult[];
  averageMood?: number;
  
  status: 'SCHEDULED' | 'SENT' | 'CLOSED' | 'CANCELLED';
}

export interface PulseResult {
  questionId: string;
  questionText: string;
  
  // Aggregated results
  averageScore?: number;
  moodDistribution?: Record<string, number>;
  yesPercentage?: number;
  responseCount: number;
  
  // Trend
  previousScore?: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendPercentage?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTION ITEMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EngagementActionItem {
  id: string;
  
  // Source
  sourceType: 'SURVEY' | 'PULSE' | 'FEEDBACK' | 'MANUAL';
  surveyId?: string;
  pulseCheckId?: string;
  feedbackId?: string;
  
  // Details
  title: string;
  description?: string;
  
  // Dimension
  dimension?: EngagementDimension;
  
  // Priority
  priority: ActionItemPriority;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  effortLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Assignment
  assigneeId?: string;
  assigneeName?: string;
  departmentId?: string;
  
  // Timeline
  dueDate?: Date;
  completedDate?: Date;
  
  // Status
  status: ActionItemStatus;
  
  // Progress
  progressNotes: ActionProgressNote[];
  
  // Metrics
  targetMetric?: string;
  targetValue?: number;
  currentValue?: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionProgressNote {
  id: string;
  actionItemId: string;
  
  note: string;
  
  previousStatus: ActionItemStatus;
  newStatus: ActionItemStatus;
  
  createdBy: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

export interface EngagementAnalytics {
  surveyId?: string;
  asOfDate: Date;
  
  // Overall metrics
  overallEngagementScore: number;
  enps: number;                      // Employee Net Promoter Score
  responseRate: number;
  
  // Dimension scores
  dimensionScores: {
    dimension: EngagementDimension;
    score: number;
    benchmark?: number;
    previousScore?: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    questionCount: number;
  }[];
  
  // Distribution
  scoreDistribution: {
    range: string;                   // '0-20', '21-40', etc.
    count: number;
    percentage: number;
  }[];
  
  // eNPS breakdown
  enpsBreakdown: {
    promoters: number;               // 9-10
    passives: number;                // 7-8
    detractors: number;              // 0-6
    promoterPercentage: number;
    passivePercentage: number;
    detractorPercentage: number;
  };
  
  // By demographics
  demographicAnalysis: {
    byDepartment: DemographicScore[];
    byLocation: DemographicScore[];
    byTenure: DemographicScore[];
    byLevel: DemographicScore[];
    byAge: DemographicScore[];
  };
  
  // Trends
  historicalTrends: {
    date: Date;
    surveyId: string;
    engagementScore: number;
    enps: number;
    responseRate: number;
  }[];
  
  // Top strengths and concerns
  topStrengths: {
    questionId: string;
    questionText: string;
    score: number;
    dimension: EngagementDimension;
  }[];
  
  topConcerns: {
    questionId: string;
    questionText: string;
    score: number;
    dimension: EngagementDimension;
  }[];
  
  // Word cloud from text responses
  wordCloud: {
    word: string;
    count: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }[];
  
  // Sentiment analysis
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface DemographicScore {
  groupId: string;
  groupName: string;
  score: number;
  responseCount: number;
  benchmark?: number;
  previousScore?: number;
}

export interface EngagementDashboard {
  // Current state
  currentEngagementScore: number;
  currentEnps: number;
  latestPulseMood: number;
  
  // Changes
  engagementScoreChange: number;
  enpsChange: number;
  
  // Active surveys
  activeSurveys: {
    id: string;
    title: string;
    type: SurveyType;
    responseRate: number;
    daysRemaining: number;
  }[];
  
  // Recent feedback
  recentRecognitions: {
    id: string;
    senderName: string;
    recipientName: string;
    content: string;
    createdAt: Date;
  }[];
  
  // Action items
  actionItems: {
    open: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  
  // Dimension summary
  dimensionSummary: {
    dimension: EngagementDimension;
    score: number;
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  }[];
  
  // Pulse trends
  pulseTrends: {
    date: Date;
    averageMood: number;
    responseRate: number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENCHMARKS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EngagementBenchmark {
  id: string;
  name: string;
  description?: string;
  
  source: 'INTERNAL' | 'INDUSTRY' | 'REGIONAL' | 'GLOBAL';
  
  industry?: string;
  region?: string;
  companySize?: string;
  
  year: number;
  
  // Scores
  overallEngagementScore: number;
  enps: number;
  
  dimensionScores: {
    dimension: EngagementDimension;
    score: number;
  }[];
  
  sampleSize: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateSurveyDto {
  title: string;
  description?: string;
  type: SurveyType;
  startDate: Date;
  endDate: Date;
  isAnonymous: boolean;
  audienceType: 'ALL' | 'DEPARTMENT' | 'LOCATION' | 'CUSTOM';
  audienceDepartmentIds?: string[];
  welcomeMessage?: string;
  thankYouMessage?: string;
}

export interface CreateSectionDto {
  surveyId: string;
  title: string;
  description?: string;
  dimension?: EngagementDimension;
  order: number;
}

export interface CreateQuestionDto {
  sectionId: string;
  text: string;
  type: QuestionType;
  dimension?: EngagementDimension;
  order: number;
  isRequired: boolean;
  options?: { text: string; value: string | number; score?: number }[];
  scaleMin?: number;
  scaleMax?: number;
}

export interface SubmitResponseDto {
  surveyId: string;
  respondentToken: string;
  answers: {
    questionId: string;
    selectedOptionIds?: string[];
    textValue?: string;
    numericValue?: number;
  }[];
}

export interface CreateFeedbackDto {
  type: FeedbackType;
  visibility: FeedbackVisibility;
  recipientType: 'EMPLOYEE' | 'TEAM' | 'DEPARTMENT' | 'COMPANY';
  recipientId?: string;
  title?: string;
  content: string;
  isAnonymous: boolean;
  badgeId?: string;
  companyValueId?: string;
}

export interface CreateActionItemDto {
  sourceType: 'SURVEY' | 'PULSE' | 'FEEDBACK' | 'MANUAL';
  surveyId?: string;
  title: string;
  description?: string;
  dimension?: EngagementDimension;
  priority: ActionItemPriority;
  assigneeId?: string;
  departmentId?: string;
  dueDate?: Date;
}

export interface SurveyFilters {
  type?: SurveyType;
  status?: SurveyStatus;
  startDateFrom?: Date;
  startDateTo?: Date;
}

export interface FeedbackFilters {
  type?: FeedbackType;
  visibility?: FeedbackVisibility;
  recipientId?: string;
  senderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
