// ═══════════════════════════════════════════════════════════════
// LEARNING & DEVELOPMENT TYPES
// ═══════════════════════════════════════════════════════════════

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: SkillCategory;
  children?: SkillCategory[];
  skills?: Skill[];
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: SkillCategory;
  levels: Record<string, string>;
  isActive: boolean;
  order: number;
}

export interface EmployeeSkill {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string; employeeCode: string };
  skillId: string;
  skill?: Skill;
  currentLevel: number;
  targetLevel?: number;
  selfAssessment?: number;
  managerAssessment?: number;
  assessedAt?: Date;
  assessedById?: string;
  notes?: string;
}

export interface PositionSkill {
  id: string;
  skillId: string;
  skill?: Skill;
  position: string;
  requiredLevel: number;
  isRequired: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  code?: string;
  parentId?: string;
  parent?: CourseCategory;
  children?: CourseCategory[];
  order: number;
  _count?: { courses: number };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  objectives?: string;
  categoryId?: string;
  category?: CourseCategory;
  courseType: string;
  level: string;
  durationHours: number;
  contentUrl?: string;
  contentType?: string;
  maxParticipants?: number;
  minParticipants?: number;
  providerId?: string;
  provider?: TrainingProvider;
  instructorName?: string;
  costPerPerson?: number;
  currency: string;
  prerequisites?: string;
  targetAudience?: string;
  isMandatory: boolean;
  mandatoryForPositions?: string[];
  recertificationMonths?: number;
  thumbnailUrl?: string;
  status: string;
  publishedAt?: Date;
  modules?: CourseModule[];
  skills?: CourseSkill[];
  _count?: { enrollments: number; sessions: number };
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  contentUrl?: string;
  contentType?: string;
  durationMinutes: number;
  order: number;
  isCompleted?: boolean;
}

export interface CourseSkill {
  id: string;
  courseId: string;
  skillId: string;
  skill?: Skill;
  skillLevelGained: number;
}

export interface TrainingProvider {
  id: string;
  name: string;
  code?: string;
  type: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}

export interface TrainingSession {
  id: string;
  courseId: string;
  course?: Course;
  sessionCode: string;
  title?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  room?: string;
  isVirtual: boolean;
  virtualLink?: string;
  providerId?: string;
  provider?: TrainingProvider;
  instructorName?: string;
  instructorEmail?: string;
  maxParticipants: number;
  minParticipants?: number;
  totalCost?: number;
  costPerPerson?: number;
  enrollmentDeadline?: Date;
  autoConfirm: boolean;
  status: string;
  cancellationReason?: string;
  notes?: string;
  _count?: { enrollments: number };
}

export interface Enrollment {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string; employeeCode: string; position?: string };
  courseId: string;
  course?: Course;
  sessionId?: string;
  session?: TrainingSession;
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  score?: number;
  passed?: boolean;
  approvedById?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  actualCost?: number;
  rating?: number;
  feedback?: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  requestId?: string;
  moduleCompletions?: ModuleCompletion[];
}

export interface ModuleCompletion {
  id: string;
  enrollmentId: string;
  moduleId: string;
  module?: CourseModule;
  completedAt: Date;
  timeSpentMinutes?: number;
}

export interface SessionAttendance {
  id: string;
  sessionId: string;
  employeeId: string;
  employee?: { id: string; fullName: string };
  date: Date;
  attended: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
}

export interface TrainingRequest {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string; employeeCode: string };
  requestCode: string;
  courseId?: string;
  externalCourseName?: string;
  externalProvider?: string;
  externalUrl?: string;
  reason: string;
  expectedOutcome?: string;
  preferredStartDate?: Date;
  preferredEndDate?: Date;
  estimatedCost?: number;
  status: string;
  managerApprovedById?: string;
  managerApprovedAt?: Date;
  managerComments?: string;
  hrApprovedById?: string;
  hrApprovedAt?: Date;
  hrComments?: string;
  rejectedById?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  targetPosition?: string;
  targetLevel?: string;
  estimatedMonths?: number;
  totalHours?: number;
  thumbnailUrl?: string;
  isActive: boolean;
  isPublic: boolean;
  stages?: LearningPathStage[];
  _count?: { enrollments: number };
}

export interface LearningPathStage {
  id: string;
  pathId: string;
  name: string;
  description?: string;
  order: number;
  targetMonths?: number;
  courses?: LearningPathCourse[];
}

export interface LearningPathCourse {
  id: string;
  stageId: string;
  courseId: string;
  course?: Course;
  isRequired: boolean;
  order: number;
}

export interface LearningPathEnrollment {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string };
  pathId: string;
  path?: LearningPath;
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  currentStageId?: string;
  progress: number;
  targetCompletionDate?: Date;
  assignedById?: string;
}

export interface CertificationType {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  validityMonths?: number;
  isExternal: boolean;
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string };
  certificationTypeId: string;
  certificationType?: CertificationType;
  certificateNumber?: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: string;
  documentUrl?: string;
  cost?: number;
  paidByCompany: boolean;
  renewalReminderSent: boolean;
  renewalRequestedAt?: Date;
  notes?: string;
  verifiedById?: string;
  verifiedAt?: Date;
}

export interface Assessment {
  id: string;
  courseId?: string;
  course?: Course;
  title: string;
  description?: string;
  instructions?: string;
  assessmentType: string;
  timeLimitMinutes?: number;
  passingScore: number;
  totalPoints: number;
  maxAttempts: number;
  availableFrom?: Date;
  availableUntil?: Date;
  isActive: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  questions?: AssessmentQuestion[];
  _count?: { attempts: number };
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessment?: Assessment;
  employeeId: string;
  employee?: { id: string; fullName: string };
  enrollmentId?: string;
  attemptNumber: number;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  percentageScore?: number;
  passed?: boolean;
  timeSpentMinutes?: number;
  responses?: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  attemptId: string;
  questionId: string;
  question?: AssessmentQuestion;
  response?: string;
  selectedOptions?: string[];
  isCorrect?: boolean;
  pointsEarned?: number;
  gradedById?: string;
  gradedAt?: Date;
  graderComments?: string;
}

export interface TrainingBudget {
  id: string;
  year: number;
  departmentId?: string;
  department?: { id: string; name: string };
  totalBudget: number;
  allocatedAmount: number;
  spentAmount: number;
  notes?: string;
}

export interface LearningAnalytics {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageScore: number;
  totalTrainingHours: number;
  topCourses: { courseId: string; title: string; enrollments: number }[];
  skillGaps: { skillId: string; name: string; avgGap: number }[];
  departmentStats: { department: string; hours: number; completion: number }[];
  monthlyTrend: { month: string; enrollments: number; completions: number }[];
  budgetUtilization: { department: string; budget: number; spent: number }[];
}
