// ═══════════════════════════════════════════════════════════════
// PERFORMANCE TYPES
// ═══════════════════════════════════════════════════════════════

export interface Goal {
  id: string
  title: string
  description?: string
  goalType: string
  category?: string
  ownerId?: string
  owner?: { id: string; fullName: string; employeeCode: string }
  departmentId?: string
  department?: { id: string; name: string }
  parentGoalId?: string
  parentGoal?: Goal
  childGoals?: Goal[]
  startDate: string
  endDate: string
  targetValue?: number
  currentValue?: number
  unit?: string
  weight: number
  status: string
  priority: string
  progress: number
  score?: number
  reviewCycleId?: string
  keyResults?: KeyResult[]
  _count?: { childGoals: number }
  createdAt: string
}

export interface KeyResult {
  id: string
  goalId: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  unit?: string
  weight: number
  progress: number
  dueDate?: string
  completedAt?: string
  order: number
}

export interface ReviewCycle {
  id: string
  name: string
  description?: string
  cycleType: string
  year: number
  startDate: string
  endDate: string
  goalSettingStart?: string
  goalSettingEnd?: string
  selfReviewStart?: string
  selfReviewEnd?: string
  managerReviewStart?: string
  managerReviewEnd?: string
  calibrationStart?: string
  calibrationEnd?: string
  goalWeight: number
  competencyWeight: number
  valuesWeight: number
  feedbackWeight: number
  allowSelfReview: boolean
  allow360Feedback: boolean
  requireCalibration: boolean
  status: string
  _count?: { reviews: number; goals: number }
}

export interface PerformanceReview {
  id: string
  reviewCycleId: string
  reviewCycle?: ReviewCycle
  employeeId: string
  employee?: { id: string; fullName: string; employeeCode: string; position?: string; department?: { id: string; name: string } }
  managerId: string
  manager?: { id: string; fullName: string; position?: string }
  status: string
  goalScore?: number
  competencyScore?: number
  valuesScore?: number
  feedbackScore?: number
  overallScore?: number
  selfRating?: number
  managerRating?: number
  calibratedRating?: number
  finalRating?: number
  selfComments?: string
  managerComments?: string
  employeeComments?: string
  strengths?: string
  developmentAreas?: string
  developmentPlan?: DevelopmentPlanItem[]
  selfReviewAt?: string
  managerReviewAt?: string
  calibratedAt?: string
  acknowledgedAt?: string
  goals?: ReviewGoal[]
  competencies?: ReviewCompetency[]
  values?: ReviewValue[]
}

export interface ReviewGoal {
  id: string
  reviewId: string
  goalId: string
  goal?: Goal
  selfScore?: number
  selfComments?: string
  managerScore?: number
  managerComments?: string
  finalScore?: number
}

export interface ReviewCompetency {
  id: string
  reviewId: string
  competencyId: string
  competency?: Competency
  requiredLevel: number
  selfRating?: number
  selfComments?: string
  managerRating?: number
  managerComments?: string
  finalRating?: number
}

export interface ReviewValue {
  id: string
  reviewId: string
  coreValueId: string
  coreValue?: CoreValue
  selfRating?: number
  selfComments?: string
  managerRating?: number
  managerComments?: string
  peerRating?: number
  finalRating?: number
}

export interface DevelopmentPlanItem {
  area: string
  action: string
  timeline: string
  resources?: string
}

export interface CompetencyFramework {
  id: string
  name: string
  description?: string
  isActive: boolean
  competencies: Competency[]
}

export interface Competency {
  id: string
  frameworkId: string
  name: string
  description?: string
  category?: string
  levels: Record<string, string>
  isCore: boolean
  order: number
}

export interface CoreValue {
  id: string
  name: string
  description?: string
  indicators: Record<string, string[]>
  isActive: boolean
  order: number
}

export interface FeedbackData {
  id: string
  requestId?: string
  providerId: string
  provider?: { id: string; name: string } | null
  subjectId: string
  subject?: { id: string; fullName: string }
  feedbackType: string
  overallRating?: number
  ratings?: Record<string, number>
  strengths?: string
  areasForImprovement?: string
  comments?: string
  recognitionType?: string
  isPublic: boolean
  isAnonymous: boolean
  createdAt: string
}

export interface FeedbackRequest {
  id: string
  reviewId?: string
  requesterId: string
  requester?: { id: string; name: string }
  providerId: string
  provider?: { id: string; name: string }
  subjectId: string
  subject?: { id: string; fullName: string }
  feedbackType: string
  status: string
  dueDate?: string
  questions?: string[]
  requestedAt: string
  respondedAt?: string
  response?: FeedbackData
}

export interface CheckIn {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  managerId: string
  manager?: { id: string; fullName: string }
  checkInDate: string
  accomplishments?: string
  challenges?: string
  priorities?: string
  supportNeeded?: string
  moodRating?: number
  managerNotes?: string
  actionItems?: ActionItem[]
  isCompleted: boolean
}

export interface OneOnOne {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string }
  managerId: string
  manager?: { id: string; fullName: string }
  scheduledAt: string
  duration: number
  agenda?: AgendaItem[]
  employeeNotes?: string
  managerNotes?: string
  actionItems?: ActionItem[]
  completedAt?: string
}

export interface AgendaItem {
  topic: string
  owner: 'employee' | 'manager'
  notes?: string
}

export interface ActionItem {
  task: string
  assignee: string
  dueDate?: string
  completed: boolean
}

export interface CalibrationSession {
  id: string
  reviewCycleId: string
  name: string
  description?: string
  departmentId?: string
  department?: { id: string; name: string }
  scheduledAt: string
  completedAt?: string
  facilitatorId: string
  facilitator?: { id: string; name: string }
  participantIds: string[]
  notes?: string
  decisions?: CalibrationDecision[]
}

export interface CalibrationDecision {
  id: string
  sessionId: string
  employeeId: string
  employee?: { id: string; fullName: string }
  originalRating: number
  calibratedRating: number
  reason?: string
  decidedById: string
}

export interface PIP {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string; employeeCode: string }
  managerId: string
  manager?: { id: string; fullName: string }
  hrContactId?: string
  hrContact?: { id: string; name: string }
  startDate: string
  endDate: string
  performanceIssues: string
  impactDescription?: string
  expectedOutcomes: string
  supportProvided?: string
  resources?: string
  status: string
  outcome?: string
  completedAt?: string
  employeeAcknowledgedAt?: string
  milestones?: PIPMilestone[]
  checkIns?: PIPCheckIn[]
}

export interface PIPMilestone {
  id: string
  pipId: string
  title: string
  description?: string
  dueDate: string
  completedAt?: string
  status: string
  notes?: string
  order: number
}

export interface PIPCheckIn {
  id: string
  pipId: string
  checkInDate: string
  progressNotes: string
  managerAssessment?: string
  isOnTrack: boolean
  nextSteps?: string
  createdById: string
}

export interface PerformanceAnalytics {
  totalReviews: number
  completedReviews: number
  averageRating: number
  ratingDistribution: { rating: number; count: number; percentage: number }[]
  goalCompletionRate: number
  topPerformers: { employeeId: string; name: string; rating: number }[]
  departmentComparison: { department: string; avgRating: number; count: number }[]
  ratingTrend: { period: string; avgRating: number }[]
}
