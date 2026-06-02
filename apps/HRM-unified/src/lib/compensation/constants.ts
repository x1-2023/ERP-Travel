export const COMPENSATION_REVIEW_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Bản nháp', color: 'gray' },
  PENDING_MANAGER: { label: 'Chờ quản lý', color: 'yellow' },
  PENDING_HR: { label: 'Chờ HR', color: 'orange' },
  PENDING_CALIBRATION: { label: 'Chờ calibration', color: 'blue' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'purple' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  COMPLETED: { label: 'Hoàn thành', color: 'emerald' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export const COMPENSATION_CHANGE_TYPE: Record<string, { label: string }> = {
  MERIT_INCREASE: { label: 'Tăng lương theo hiệu suất' },
  PROMOTION: { label: 'Thăng chức' },
  ADJUSTMENT: { label: 'Điều chỉnh' },
  MARKET_CORRECTION: { label: 'Điều chỉnh thị trường' },
  DEMOTION: { label: 'Giáng chức' },
  NEW_HIRE: { label: 'Nhân viên mới' },
  TRANSFER: { label: 'Chuyển công tác' },
};

export const BENEFIT_TYPE: Record<string, { label: string }> = {
  MANDATORY: { label: 'Bắt buộc' },
  OPTIONAL: { label: 'Tùy chọn' },
  ALLOWANCE: { label: 'Phụ cấp' },
  PERK: { label: 'Đãi ngộ' },
};

export const BENEFIT_ENROLLMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'yellow' },
  ACTIVE: { label: 'Đang hưởng', color: 'green' },
  DECLINED: { label: 'Từ chối', color: 'gray' },
  EXPIRED: { label: 'Hết hạn', color: 'red' },
  CANCELLED: { label: 'Đã hủy', color: 'gray' },
};

export const ALLOWANCE_FREQUENCY: Record<string, { label: string }> = {
  MONTHLY: { label: 'Hàng tháng' },
  QUARTERLY: { label: 'Hàng quý' },
  ANNUAL: { label: 'Hàng năm' },
  ONE_TIME: { label: 'Một lần' },
};

export const COMPENSATION_CYCLE_STATUS: Record<string, { label: string; color: string }> = {
  PLANNING: { label: 'Lập kế hoạch', color: 'gray' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'blue' },
  CALIBRATION: { label: 'Calibration', color: 'purple' },
  APPROVAL: { label: 'Phê duyệt', color: 'yellow' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
};

export const COMPA_RATIO_RANGES = [
  { min: 0, max: 0.8, label: 'Dưới mức', color: 'red' },
  { min: 0.8, max: 0.9, label: 'Thấp', color: 'orange' },
  { min: 0.9, max: 1.1, label: 'Phù hợp', color: 'green' },
  { min: 1.1, max: 1.2, label: 'Cao', color: 'blue' },
  { min: 1.2, max: 999, label: 'Trên mức', color: 'purple' },
];

export const PERFORMANCE_RATING_LABELS: Record<number, string> = {
  1: 'Không đạt',
  2: 'Cần cải thiện',
  3: 'Đạt yêu cầu',
  4: 'Xuất sắc',
  5: 'Vượt trội',
};

export const DEFAULT_MERIT_MATRIX = [
  // Performance 1
  { performanceRating: 1, compaRatioMin: 0, compaRatioMax: 0.8, meritIncreasePercent: 0 },
  { performanceRating: 1, compaRatioMin: 0.8, compaRatioMax: 0.9, meritIncreasePercent: 0 },
  { performanceRating: 1, compaRatioMin: 0.9, compaRatioMax: 1.1, meritIncreasePercent: 0 },
  { performanceRating: 1, compaRatioMin: 1.1, compaRatioMax: 1.2, meritIncreasePercent: 0 },
  { performanceRating: 1, compaRatioMin: 1.2, compaRatioMax: 999, meritIncreasePercent: 0 },
  // Performance 2
  { performanceRating: 2, compaRatioMin: 0, compaRatioMax: 0.8, meritIncreasePercent: 4 },
  { performanceRating: 2, compaRatioMin: 0.8, compaRatioMax: 0.9, meritIncreasePercent: 3 },
  { performanceRating: 2, compaRatioMin: 0.9, compaRatioMax: 1.1, meritIncreasePercent: 2 },
  { performanceRating: 2, compaRatioMin: 1.1, compaRatioMax: 1.2, meritIncreasePercent: 1 },
  { performanceRating: 2, compaRatioMin: 1.2, compaRatioMax: 999, meritIncreasePercent: 0 },
  // Performance 3
  { performanceRating: 3, compaRatioMin: 0, compaRatioMax: 0.8, meritIncreasePercent: 8 },
  { performanceRating: 3, compaRatioMin: 0.8, compaRatioMax: 0.9, meritIncreasePercent: 6 },
  { performanceRating: 3, compaRatioMin: 0.9, compaRatioMax: 1.1, meritIncreasePercent: 4 },
  { performanceRating: 3, compaRatioMin: 1.1, compaRatioMax: 1.2, meritIncreasePercent: 3 },
  { performanceRating: 3, compaRatioMin: 1.2, compaRatioMax: 999, meritIncreasePercent: 2 },
  // Performance 4
  { performanceRating: 4, compaRatioMin: 0, compaRatioMax: 0.8, meritIncreasePercent: 12 },
  { performanceRating: 4, compaRatioMin: 0.8, compaRatioMax: 0.9, meritIncreasePercent: 9 },
  { performanceRating: 4, compaRatioMin: 0.9, compaRatioMax: 1.1, meritIncreasePercent: 7 },
  { performanceRating: 4, compaRatioMin: 1.1, compaRatioMax: 1.2, meritIncreasePercent: 5 },
  { performanceRating: 4, compaRatioMin: 1.2, compaRatioMax: 999, meritIncreasePercent: 3 },
  // Performance 5
  { performanceRating: 5, compaRatioMin: 0, compaRatioMax: 0.8, meritIncreasePercent: 15 },
  { performanceRating: 5, compaRatioMin: 0.8, compaRatioMax: 0.9, meritIncreasePercent: 12 },
  { performanceRating: 5, compaRatioMin: 0.9, compaRatioMax: 1.1, meritIncreasePercent: 10 },
  { performanceRating: 5, compaRatioMin: 1.1, compaRatioMax: 1.2, meritIncreasePercent: 7 },
  { performanceRating: 5, compaRatioMin: 1.2, compaRatioMax: 999, meritIncreasePercent: 5 },
];

export const DEFAULT_SALARY_GRADES = [
  { code: 'G1', name: 'Entry Level', level: 1, minSalary: 8000000, midSalary: 10000000, maxSalary: 12000000 },
  { code: 'G2', name: 'Junior', level: 2, minSalary: 12000000, midSalary: 15000000, maxSalary: 18000000 },
  { code: 'G3', name: 'Mid-Level', level: 3, minSalary: 18000000, midSalary: 23000000, maxSalary: 28000000 },
  { code: 'G4', name: 'Senior', level: 4, minSalary: 28000000, midSalary: 35000000, maxSalary: 42000000 },
  { code: 'G5', name: 'Lead/Expert', level: 5, minSalary: 42000000, midSalary: 52000000, maxSalary: 62000000 },
  { code: 'G6', name: 'Manager', level: 6, minSalary: 55000000, midSalary: 70000000, maxSalary: 85000000 },
  { code: 'G7', name: 'Director', level: 7, minSalary: 80000000, midSalary: 100000000, maxSalary: 120000000 },
  { code: 'G8', name: 'VP/C-Level', level: 8, minSalary: 120000000, midSalary: 150000000, maxSalary: 200000000 },
];

// Vietnamese mandatory insurance rates
export const INSURANCE_RATES = {
  BHXH: { employer: 17.5, employee: 8, ceiling: 36000000, label: 'Bảo hiểm xã hội' },
  BHYT: { employer: 3, employee: 1.5, ceiling: 36000000, label: 'Bảo hiểm y tế' },
  BHTN: { employer: 1, employee: 1, ceiling: 36000000, label: 'Bảo hiểm thất nghiệp' },
};
