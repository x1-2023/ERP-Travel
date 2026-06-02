export const REQUISITION_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  OPEN: { label: 'Đang tuyển', color: 'green' },
  ON_HOLD: { label: 'Tạm dừng', color: 'orange' },
  FILLED: { label: 'Đã tuyển đủ', color: 'purple' },
  CANCELLED: { label: 'Đã hủy', color: 'gray' },
}

export const JOB_POSTING_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PUBLISHED: { label: 'Đang đăng', color: 'green' },
  CLOSED: { label: 'Đã đóng', color: 'red' },
  ARCHIVED: { label: 'Lưu trữ', color: 'gray' },
}

export const APPLICATION_STATUS: Record<string, { label: string; color: string; stage: number }> = {
  NEW: { label: 'Mới', color: 'blue', stage: 1 },
  SCREENING: { label: 'Sàng lọc', color: 'yellow', stage: 2 },
  PHONE_SCREEN: { label: 'PV điện thoại', color: 'orange', stage: 3 },
  INTERVIEW: { label: 'Phỏng vấn', color: 'purple', stage: 4 },
  ASSESSMENT: { label: 'Đánh giá', color: 'indigo', stage: 5 },
  OFFER: { label: 'Offer', color: 'green', stage: 6 },
  HIRED: { label: 'Đã tuyển', color: 'emerald', stage: 7 },
  REJECTED: { label: 'Từ chối', color: 'red', stage: -1 },
  WITHDRAWN: { label: 'Rút hồ sơ', color: 'gray', stage: -1 },
}

export const APPLICATION_SOURCE: Record<string, { label: string }> = {
  CAREERS_PAGE: { label: 'Trang tuyển dụng' },
  INTERNAL: { label: 'Nội bộ' },
  REFERRAL: { label: 'Giới thiệu' },
  LINKEDIN: { label: 'LinkedIn' },
  FACEBOOK: { label: 'Facebook' },
  JOB_BOARD: { label: 'Trang việc làm' },
  AGENCY: { label: 'Headhunter' },
  OTHER: { label: 'Khác' },
}

export const JOB_TYPE: Record<string, { label: string; shortLabel: string }> = {
  FULL_TIME: { label: 'Toàn thời gian', shortLabel: 'Full-time' },
  PART_TIME: { label: 'Bán thời gian', shortLabel: 'Part-time' },
  CONTRACT: { label: 'Hợp đồng', shortLabel: 'Contract' },
  INTERNSHIP: { label: 'Thực tập', shortLabel: 'Intern' },
  TEMPORARY: { label: 'Tạm thời', shortLabel: 'Temp' },
}

export const WORK_MODE: Record<string, { label: string; shortLabel: string }> = {
  ONSITE: { label: 'Làm việc tại văn phòng', shortLabel: 'Onsite' },
  REMOTE: { label: 'Làm việc từ xa', shortLabel: 'Remote' },
  HYBRID: { label: 'Kết hợp', shortLabel: 'Hybrid' },
}

export const INTERVIEW_TYPE: Record<string, { label: string }> = {
  PHONE: { label: 'Phỏng vấn điện thoại' },
  VIDEO: { label: 'Phỏng vấn video' },
  ONSITE: { label: 'Phỏng vấn trực tiếp' },
  TECHNICAL: { label: 'Phỏng vấn kỹ thuật' },
  HR: { label: 'Phỏng vấn HR' },
  FINAL: { label: 'Phỏng vấn cuối' },
}

export const INTERVIEW_RESULT: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ kết quả', color: 'gray' },
  PASSED: { label: 'Đạt', color: 'green' },
  FAILED: { label: 'Không đạt', color: 'red' },
  NO_SHOW: { label: 'Vắng mặt', color: 'orange' },
  RESCHEDULED: { label: 'Dời lịch', color: 'yellow' },
}

export const OFFER_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'gray' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'yellow' },
  APPROVED: { label: 'Đã duyệt', color: 'blue' },
  SENT: { label: 'Đã gửi', color: 'purple' },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'green' },
  DECLINED: { label: 'Từ chối', color: 'red' },
  EXPIRED: { label: 'Hết hạn', color: 'gray' },
  WITHDRAWN: { label: 'Đã thu hồi', color: 'orange' },
}

export const RECOMMENDATION: Record<string, { label: string; color: string; score: number }> = {
  STRONG_HIRE: { label: 'Nên tuyển (Strong)', color: 'green', score: 5 },
  HIRE: { label: 'Nên tuyển', color: 'emerald', score: 4 },
  NO_HIRE: { label: 'Không nên tuyển', color: 'orange', score: 2 },
  STRONG_NO_HIRE: { label: 'Không nên tuyển (Strong)', color: 'red', score: 1 },
}

export const ONBOARDING_STATUS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Chưa bắt đầu', color: 'gray' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
}

export const ONBOARDING_TASK_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'gray' },
  IN_PROGRESS: { label: 'Đang làm', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  SKIPPED: { label: 'Bỏ qua', color: 'yellow' },
  OVERDUE: { label: 'Quá hạn', color: 'red' },
}

export const ONBOARDING_CATEGORY: Record<string, { label: string; order: number }> = {
  PRE_BOARDING: { label: 'Trước ngày làm', order: 1 },
  DAY_1: { label: 'Ngày đầu tiên', order: 2 },
  WEEK_1: { label: 'Tuần đầu tiên', order: 3 },
  MONTH_1: { label: 'Tháng đầu tiên', order: 4 },
}

export const ASSIGNEE_TYPE: Record<string, { label: string }> = {
  HR: { label: 'HR' },
  MANAGER: { label: 'Quản lý' },
  IT: { label: 'IT' },
  EMPLOYEE: { label: 'Nhân viên mới' },
  BUDDY: { label: 'Buddy' },
}

export const PRIORITY: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Thấp', color: 'gray' },
  NORMAL: { label: 'Bình thường', color: 'blue' },
  HIGH: { label: 'Cao', color: 'orange' },
  URGENT: { label: 'Gấp', color: 'red' },
}

export const PIPELINE_STAGES = [
  { id: 'NEW', label: 'Mới', color: 'bg-blue-100' },
  { id: 'SCREENING', label: 'Sàng lọc', color: 'bg-yellow-100' },
  { id: 'PHONE_SCREEN', label: 'PV điện thoại', color: 'bg-orange-100' },
  { id: 'INTERVIEW', label: 'Phỏng vấn', color: 'bg-purple-100' },
  { id: 'ASSESSMENT', label: 'Đánh giá', color: 'bg-indigo-100' },
  { id: 'OFFER', label: 'Offer', color: 'bg-green-100' },
  { id: 'HIRED', label: 'Đã tuyển', color: 'bg-emerald-100' },
  { id: 'REJECTED', label: 'Từ chối', color: 'bg-red-100' },
]
