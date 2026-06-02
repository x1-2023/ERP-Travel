// src/constants/attendance.ts
// Sprint 2: Time & Attendance Constants

// ═══════════════════════════════════════════════════════════════
// OT MULTIPLIERS (VIETNAM LABOR LAW)
// ═══════════════════════════════════════════════════════════════

export const OT_MULTIPLIERS = {
  WEEKDAY: 1.5,      // 150% - Ngày thường
  WEEKEND: 2.0,      // 200% - Cuối tuần
  HOLIDAY: 3.0,      // 300% - Ngày lễ
} as const

export const NIGHT_BONUS = 0.3  // +30% cho ca đêm (22:00-06:00)

export const NIGHT_SHIFT_HOURS = {
  START: '22:00',
  END: '06:00',
} as const

// ═══════════════════════════════════════════════════════════════
// DEFAULT SHIFT SETTINGS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_SHIFT = {
  START_TIME: '08:00',
  END_TIME: '17:00',
  BREAK_START: '12:00',
  BREAK_END: '13:00',
  BREAK_MINUTES: 60,
  WORK_HOURS: 8,
  LATE_GRACE: 15,     // phút
  EARLY_GRACE: 15,    // phút
  OT_START_AFTER: 30, // phút
} as const

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Có mặt',
  ABSENT: 'Vắng mặt',
  LATE: 'Đi trễ',
  EARLY_LEAVE: 'Về sớm',
  LATE_AND_EARLY: 'Đi trễ & Về sớm',
  ON_LEAVE: 'Nghỉ phép',
  BUSINESS_TRIP: 'Công tác',
  WORK_FROM_HOME: 'Làm tại nhà',
  HOLIDAY: 'Nghỉ lễ',
}

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  EARLY_LEAVE: 'bg-orange-100 text-orange-800',
  LATE_AND_EARLY: 'bg-amber-100 text-amber-800',
  ON_LEAVE: 'bg-blue-100 text-blue-800',
  BUSINESS_TRIP: 'bg-purple-100 text-purple-800',
  WORK_FROM_HOME: 'bg-indigo-100 text-indigo-800',
  HOLIDAY: 'bg-pink-100 text-pink-800',
}

// ═══════════════════════════════════════════════════════════════
// SHIFT TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const SHIFT_TYPE_LABELS: Record<string, string> = {
  STANDARD: 'Ca hành chính',
  MORNING: 'Ca sáng',
  AFTERNOON: 'Ca chiều',
  NIGHT: 'Ca đêm',
  FLEXIBLE: 'Ca linh hoạt',
  ROTATING: 'Ca xoay vòng',
}

export const SHIFT_TYPE_COLORS: Record<string, string> = {
  STANDARD: '#3B82F6',  // blue
  MORNING: '#F59E0B',   // amber
  AFTERNOON: '#10B981', // emerald
  NIGHT: '#6366F1',     // indigo
  FLEXIBLE: '#8B5CF6',  // violet
  ROTATING: '#EC4899',  // pink
}

// ═══════════════════════════════════════════════════════════════
// DAY TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const DAY_TYPE_LABELS: Record<string, string> = {
  NORMAL: 'Ngày thường',
  WEEKEND: 'Cuối tuần',
  HOLIDAY: 'Ngày lễ',
  COMPENSATORY: 'Ngày bù',
}

export const DAY_TYPE_COLORS: Record<string, string> = {
  NORMAL: 'bg-gray-100 text-gray-800',
  WEEKEND: 'bg-blue-100 text-blue-800',
  HOLIDAY: 'bg-red-100 text-red-800',
  COMPENSATORY: 'bg-purple-100 text-purple-800',
}

// ═══════════════════════════════════════════════════════════════
// OT STATUS LABELS
// ═══════════════════════════════════════════════════════════════

export const OT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

export const OT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

// ═══════════════════════════════════════════════════════════════
// ANOMALY TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const ANOMALY_TYPE_LABELS: Record<string, string> = {
  MISSING_CHECKOUT: 'Thiếu checkout',
  MISSING_CHECKIN: 'Thiếu checkin',
  EARLY_CHECKIN: 'Check in quá sớm',
  LATE_CHECKOUT: 'Check out quá muộn',
  LOCATION_MISMATCH: 'Vị trí không khớp',
  DUPLICATE_RECORD: 'Bản ghi trùng lặp',
  OVERTIME_NO_REQUEST: 'Tăng ca không có đơn',
  MANUAL_ADJUSTMENT: 'Điều chỉnh thủ công',
}

export const ANOMALY_SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
}

export const ANOMALY_SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE SOURCE LABELS
// ═══════════════════════════════════════════════════════════════

export const ATTENDANCE_SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Nhập tay',
  WEB_CLOCK: 'Chấm công web',
  MOBILE_APP: 'Ứng dụng mobile',
  FINGERPRINT: 'Vân tay',
  FACE_ID: 'Nhận diện khuôn mặt',
  CARD: 'Thẻ từ',
  IMPORT: 'Import từ file',
}

// ═══════════════════════════════════════════════════════════════
// DAYS OF WEEK
// ═══════════════════════════════════════════════════════════════

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Chủ nhật', short: 'CN' },
  { value: 1, label: 'Thứ hai', short: 'T2' },
  { value: 2, label: 'Thứ ba', short: 'T3' },
  { value: 3, label: 'Thứ tư', short: 'T4' },
  { value: 4, label: 'Thứ năm', short: 'T5' },
  { value: 5, label: 'Thứ sáu', short: 'T6' },
  { value: 6, label: 'Thứ bảy', short: 'T7' },
] as const

export const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5] // T2-T6

// ═══════════════════════════════════════════════════════════════
// VIETNAM NATIONAL HOLIDAYS (Reference only - actual dates vary by year)
// ═══════════════════════════════════════════════════════════════

export const NATIONAL_HOLIDAYS = [
  { name: 'Tết Dương lịch', month: 1, day: 1, days: 1 },
  { name: 'Tết Nguyên đán', month: 0, day: 0, days: 5, lunar: true }, // Varies
  { name: 'Giỗ Tổ Hùng Vương', month: 0, day: 0, days: 1, lunar: true }, // 10/3 AL
  { name: 'Ngày Giải phóng miền Nam', month: 4, day: 30, days: 1 },
  { name: 'Ngày Quốc tế Lao động', month: 5, day: 1, days: 1 },
  { name: 'Ngày Quốc khánh', month: 9, day: 2, days: 2 }, // 2/9 + day off
] as const

// ═══════════════════════════════════════════════════════════════
// GEOLOCATION SETTINGS
// ═══════════════════════════════════════════════════════════════

export const GEOLOCATION_CONFIG = {
  ACCURACY_THRESHOLD: 100,    // meters
  TIMEOUT: 10000,             // milliseconds
  MAX_AGE: 60000,             // milliseconds
  HIGH_ACCURACY: true,
} as const

// ═══════════════════════════════════════════════════════════════
// PAGINATION DEFAULTS
// ═══════════════════════════════════════════════════════════════

export const ATTENDANCE_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
