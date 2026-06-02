export interface JobRequisition {
  id: string
  requisitionCode: string
  title: string
  departmentId: string
  department?: { id: string; name: string }
  reportingToId?: string
  reportingTo?: { id: string; fullName: string }
  jobType: string
  workMode: string
  location?: string
  headcount: number
  filledCount: number
  salaryMin?: number
  salaryMax?: number
  salaryDisplay?: string
  description?: string
  requirements?: string
  benefits?: string
  priority: string
  targetHireDate?: Date
  status: string
  requestedById: string
  requestedBy?: { id: string; name: string }
  approvedById?: string
  approvedAt?: Date
  createdAt: Date
  _count?: { applications: number }
}

export interface JobPosting {
  id: string
  requisitionId: string
  title: string
  slug: string
  description: string
  requirements: string
  benefits?: string
  location?: string
  jobType: string
  workMode: string
  salaryDisplay?: string
  isInternal: boolean
  isPublic: boolean
  status: string
  publishedAt?: Date
  expiresAt?: Date
  viewCount: number
  applicationCount: number
  createdAt: Date
}

export interface Candidate {
  id: string
  email: string
  phone?: string
  fullName: string
  dateOfBirth?: Date
  gender?: string
  address?: string
  cvUrl?: string
  cvFileName?: string
  portfolioUrl?: string
  linkedinUrl?: string
  currentCompany?: string
  currentPosition?: string
  currentSalary?: number
  expectedSalary?: number
  yearsOfExperience?: number
  skills?: string[]
  education?: Education[]
  workHistory?: WorkExperience[]
  notes?: string
  tags?: string[]
  source: string
  isBlacklisted: boolean
  createdAt: Date
}

export interface Education {
  school: string
  degree: string
  field: string
  startYear: number
  endYear?: number
  gpa?: string
}

export interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}

export interface Application {
  id: string
  applicationCode: string
  candidateId: string
  candidate?: Candidate
  requisitionId: string
  requisition?: JobRequisition
  jobPostingId?: string
  status: string
  stage: number
  screeningScore?: number
  screeningNotes?: string
  overallRating?: number
  coverLetter?: string
  source: string
  rejectionReason?: string
  assignedToId?: string
  assignedTo?: { id: string; name: string }
  interviews?: Interview[]
  evaluations?: CandidateEvaluation[]
  offers?: Offer[]
  activities?: ApplicationActivity[]
  _count?: { interviews: number; evaluations: number }
  createdAt: Date
}

export interface ApplicationActivity {
  id: string
  applicationId: string
  action: string
  description: string
  oldValue?: string
  newValue?: string
  performedById?: string
  performedBy?: { id: string; name: string }
  createdAt: Date
}

export interface Interview {
  id: string
  applicationId: string
  interviewType: string
  round: number
  scheduledAt: Date
  duration: number
  location?: string
  interviewerIds: string[]
  interviewers?: { id: string; name: string }[]
  result: string
  notes?: string
  evaluations?: CandidateEvaluation[]
}

export interface CandidateEvaluation {
  id: string
  applicationId: string
  interviewId?: string
  evaluatorId: string
  evaluator?: { id: string; name: string }
  technicalSkills?: number
  communication?: number
  problemSolving?: number
  cultureFit?: number
  experience?: number
  overallRating: number
  strengths?: string
  weaknesses?: string
  notes?: string
  recommendation: string
  createdAt: Date
}

export interface Offer {
  id: string
  offerCode: string
  applicationId: string
  application?: Application
  position: string
  departmentId: string
  department?: { id: string; name: string }
  reportingToId?: string
  jobType: string
  workMode: string
  location?: string
  baseSalary: number
  allowances?: { name: string; amount: number }[]
  bonus?: string
  benefits?: string
  startDate: Date
  probationMonths: number
  status: string
  expiresAt: Date
  sentAt?: Date
  respondedAt?: Date
  responseNote?: string
  createdAt: Date
}

export interface OnboardingData {
  id: string
  employeeId: string
  employee?: { id: string; fullName: string; employeeCode: string; position?: string }
  templateId?: string
  status: string
  startDate: Date
  expectedEndDate: Date
  completedAt?: Date
  buddyId?: string
  buddy?: { id: string; fullName: string }
  hrContactId?: string
  hrContact?: { id: string; name: string }
  progress: number
  tasks?: OnboardingTask[]
}

export interface OnboardingTask {
  id: string
  title: string
  description?: string
  category: string
  dueDate: Date
  assigneeId?: string
  assigneeType: string
  status: string
  completedAt?: Date
  isRequired: boolean
  order: number
}

export interface OnboardingTemplate {
  id: string
  name: string
  description?: string
  departmentId?: string
  positionLevel?: string
  isActive: boolean
  tasks: OnboardingTemplateTask[]
  _count?: { tasks: number }
}

export interface OnboardingTemplateTask {
  id: string
  title: string
  description?: string
  category: string
  daysOffset: number
  assigneeType: string
  isRequired: boolean
  order: number
}

export interface PipelineColumn {
  id: string
  status: string
  label: string
  applications: Application[]
}

export interface HiringAnalytics {
  openRequisitions: number
  totalApplications: number
  newApplicationsThisWeek: number
  interviewsThisWeek: number
  offersExtended: number
  offersAccepted: number
  averageTimeToHire: number
  sourceBreakdown: { source: string; count: number }[]
  stageBreakdown: { stage: string; count: number }[]
  hiringTrend: { month: string; hired: number }[]
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: string
  round: number
  location?: string
  candidate: { fullName: string; email: string }
  result: string
}
