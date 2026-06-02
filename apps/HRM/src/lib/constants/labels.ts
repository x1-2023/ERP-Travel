// Vietnamese labels for all enums used in UI display

export const PAYROLL_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PAID: "Đã trả",
  CANCELLED: "Đã hủy",
}

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: "Đúng giờ",
  LATE: "Trễ",
  HALF_DAY: "Nửa ngày",
  ABSENT: "Vắng",
  LEAVE: "Nghỉ phép",
  HOLIDAY: "Ngày lễ",
}

export const ATTENDANCE_STATUS_ICONS: Record<string, string> = {
  PRESENT: "✅",
  LATE: "🟡",
  HALF_DAY: "🔵",
  ABSENT: "❌",
  LEAVE: "📋",
  HOLIDAY: "🎉",
}

export const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Đã nộp",
  RETURNED_L1: "Trả lại (L1)",
  APPROVED_L1: "Duyệt L1",
  RETURNED_L2: "Trả lại (L2)",
  APPROVED_FINAL: "Đã duyệt",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
}

export const HR_EVENT_TYPE_LABELS: Record<string, string> = {
  DEPARTMENT_TRANSFER: "Chuyển phòng",
  PROMOTION: "Thăng chức",
  RECOGNITION: "Khen thưởng",
  DISCIPLINARY: "Kỷ luật",
  SALARY_ADJUSTMENT: "Điều chỉnh lương",
}

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  PROBATION: "Thử việc",
  DEFINITE_TERM: "Có thời hạn",
  INDEFINITE_TERM: "Không thời hạn",
  SEASONAL: "Thời vụ",
  PART_TIME: "Bán thời gian",
  INTERN: "Thực tập",
}

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  ACTIVE: "Hiệu lực",
  EXPIRED: "Hết hạn",
  TERMINATED: "Chấm dứt",
}

export const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang làm",
  PROBATION: "Thử việc",
  ON_LEAVE: "Nghỉ phép",
  RESIGNED: "Đã nghỉ",
  TERMINATED: "Chấm dứt",
  SUSPENDED: "Đình chỉ",
}

export const REPORT_TYPE_LABELS: Record<string, string> = {
  OVERTIME: "Tăng ca",
  BUSINESS_TRIP: "Công tác",
  LEAVE_PAID: "Nghỉ phép (có lương)",
  LEAVE_UNPAID: "Nghỉ không lương",
  LEAVE_SICK: "Nghỉ ốm",
  LEAVE_MATERNITY: "Nghỉ thai sản",
  LEAVE_WEDDING: "Nghỉ cưới",
  NOTE: "Ghi chú",
}
