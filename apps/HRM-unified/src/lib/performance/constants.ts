export const GOAL_TYPE = {
  COMPANY: { label: 'Công ty', color: 'purple' },
  DEPARTMENT: { label: 'Phòng ban', color: 'blue' },
  TEAM: { label: 'Team', color: 'green' },
  INDIVIDUAL: { label: 'Cá nhân', color: 'orange' },
} as const

export const GOAL_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  ACTIVE: { label: 'Đang thực hiện', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
  ON_HOLD: { label: 'Tạm dừng', color: 'yellow' },
} as const

export const GOAL_PRIORITY = {
  LOW: { label: 'Thấp', color: 'gray' },
  MEDIUM: { label: 'Trung bình', color: 'blue' },
  HIGH: { label: 'Cao', color: 'orange' },
  CRITICAL: { label: 'Quan trọng', color: 'red' },
} as const

export const REVIEW_CYCLE_TYPE = {
  ANNUAL: { label: 'Năm', duration: 12 },
  SEMI_ANNUAL: { label: '6 tháng', duration: 6 },
  QUARTERLY: { label: 'Quý', duration: 3 },
  PROBATION: { label: 'Thử việc', duration: 2 },
  PROJECT: { label: 'Dự án', duration: 0 },
  AD_HOC: { label: 'Đột xuất', duration: 0 },
} as const

export const REVIEW_CYCLE_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  GOAL_SETTING: { label: 'Thiết lập mục tiêu', color: 'blue' },
  IN_PROGRESS: { label: 'Đang diễn ra', color: 'blue' },
  SELF_REVIEW: { label: 'Tự đánh giá', color: 'yellow' },
  MANAGER_REVIEW: { label: 'Quản lý đánh giá', color: 'orange' },
  CALIBRATION: { label: 'Điều chỉnh', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
} as const

export const REVIEW_STATUS = {
  NOT_STARTED: { label: 'Chưa bắt đầu', color: 'gray', step: 0 },
  SELF_REVIEW_PENDING: { label: 'Chờ tự đánh giá', color: 'blue', step: 1 },
  SELF_REVIEW_DONE: { label: 'Đã tự đánh giá', color: 'blue', step: 2 },
  MANAGER_REVIEW_PENDING: { label: 'Chờ quản lý đánh giá', color: 'yellow', step: 3 },
  MANAGER_REVIEW_DONE: { label: 'Quản lý đã đánh giá', color: 'yellow', step: 4 },
  CALIBRATION_PENDING: { label: 'Chờ điều chỉnh', color: 'purple', step: 5 },
  COMPLETED: { label: 'Hoàn thành', color: 'green', step: 6 },
  ACKNOWLEDGED: { label: 'Đã xác nhận', color: 'green', step: 7 },
} as const

export const FEEDBACK_TYPE = {
  CONTINUOUS: { label: 'Feedback liên tục' },
  REVIEW_360: { label: '360 Review' },
  PEER: { label: 'Đồng nghiệp' },
  UPWARD: { label: 'Đánh giá ngược' },
  RECOGNITION: { label: 'Khen thưởng' },
} as const

export const FEEDBACK_REQUEST_STATUS = {
  REQUESTED: { label: 'Đã gửi yêu cầu', color: 'blue' },
  PENDING: { label: 'Chờ phản hồi', color: 'yellow' },
  SUBMITTED: { label: 'Đã gửi', color: 'green' },
  DECLINED: { label: 'Từ chối', color: 'red' },
} as const

export const PIP_STATUS = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  ACTIVE: { label: 'Đang thực hiện', color: 'blue' },
  EXTENDED: { label: 'Gia hạn', color: 'orange' },
  COMPLETED_SUCCESS: { label: 'Hoàn thành - Đạt', color: 'green' },
  COMPLETED_FAIL: { label: 'Hoàn thành - Không đạt', color: 'red' },
  CANCELLED: { label: 'Đã huỷ', color: 'gray' },
} as const

export const RATING_SCALE = [
  { value: 5, label: 'Exceptional', description: 'Vượt xa kỳ vọng, role model', color: '#22c55e' },
  { value: 4, label: 'Exceeds', description: 'Vượt kỳ vọng, high performer', color: '#84cc16' },
  { value: 3, label: 'Meets', description: 'Đạt kỳ vọng, solid contributor', color: '#eab308' },
  { value: 2, label: 'Developing', description: 'Cần cải thiện, below expectations', color: '#f97316' },
  { value: 1, label: 'Unsatisfactory', description: 'Không đạt, significant gap', color: '#ef4444' },
] as const

export const RATING_DISTRIBUTION_TARGET: Record<number, number> = {
  5: 5,
  4: 20,
  3: 50,
  2: 20,
  1: 5,
}

export const COMPETENCY_CATEGORIES = [
  'Technical',
  'Leadership',
  'Communication',
  'Problem Solving',
  'Collaboration',
] as const

export const MOOD_OPTIONS = [
  { value: 5, emoji: '😄', label: 'Rất tốt' },
  { value: 4, emoji: '🙂', label: 'Tốt' },
  { value: 3, emoji: '😐', label: 'Bình thường' },
  { value: 2, emoji: '😔', label: 'Không tốt' },
  { value: 1, emoji: '😢', label: 'Rất tệ' },
] as const

export const DEFAULT_REVIEW_WEIGHTS = {
  goal: 40,
  competency: 30,
  values: 20,
  feedback: 10,
} as const
