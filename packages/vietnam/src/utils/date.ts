/**
 * Vietnamese Date Formatting and Lunar Calendar Utilities
 * Handles Vietnamese date formatting conventions and lunar calendar conversions
 */

/**
 * Vietnamese public holidays (2024)
 * Ngày lễ, ngày Tết tại Việt Nam
 */
export const VIETNAMESE_HOLIDAYS_2024 = {
  "2024-01-01": "Tết Dương lịch (New Year's Day)",
  "2024-02-10": "Tết Âm lịch (Lunar New Year)",
  "2024-02-11": "Tết Âm lịch",
  "2024-02-12": "Tết Âm lịch",
  "2024-02-13": "Tết Âm lịch",
  "2024-02-14": "Tết Âm lịch",
  "2024-04-18": "Giỗ Tổ Hùng Vương (Hung Kings' Festival)",
  "2024-04-30": "Ngày Giải phóng miền Nam / Tết Dương lịch",
  "2024-05-01": "Ngày Quốc tế Lao động",
  "2024-09-02": "Ngày Quốc khánh Việt Nam",
  "2024-09-03": "Ngày Quốc khánh Việt Nam (replacement)",
};

/**
 * Format date in Vietnamese style (ngày - tháng - năm)
 * Example: "ngày 15 tháng 04 năm 2024"
 *
 * @param date - Date to format
 * @returns Vietnamese formatted date string
 */
export function formatDateVN(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `ngày ${day} tháng ${String(month).padStart(2, "0")} năm ${year}`;
}

/**
 * Format date as dd/MM/yyyy
 * Example: "15/04/2024"
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateDDMMYYYY(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date as yyyy-MM-dd (ISO format)
 *
 * @param date - Date to format
 * @returns ISO formatted date string
 */
export function formatDateISO(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date.toISOString().split("T")[0];
}

/**
 * Format datetime with Vietnamese locale
 * Example: "15 tháng 04 năm 2024 14:30"
 *
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTimeVN(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day} tháng ${String(month).padStart(2, "0")} năm ${year} ${hours}:${minutes}`;
}

/**
 * Parse date from Vietnamese format
 * Accepts: "ngày 15 tháng 04 năm 2024" or "15/04/2024"
 *
 * @param dateString - Vietnamese formatted date string
 * @returns Parsed Date object
 */
export function parseVNDate(dateString: string): Date {
  if (!dateString || typeof dateString !== "string") {
    throw new Error("Date string must be non-empty");
  }

  // Try Vietnamese format first
  const vnMatch = dateString.match(
    /(?:ngày\s+)?(\d{1,2})\s+(?:tháng\s+)?(\d{1,2})\s+(?:năm\s+)?(\d{4})/
  );

  if (vnMatch) {
    const [, day, month, year] = vnMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Try dd/MM/yyyy format
  const slashMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Try ISO format
  const isoMatch = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  throw new Error(`Cannot parse date: ${dateString}`);
}

/**
 * Lunar to Solar date conversion (simplified)
 * Basic conversion for common lunar dates
 * For accurate conversion, use specialized libraries
 */
export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number): Date {
  // This is a simplified approximation
  // For Vietnamese lunar calendar, the approximate offset is:
  // Solar ≈ Lunar + 20-50 days (varies by month and year)

  // Lunar New Year (1st lunar month) typically falls in late January to mid-February
  if (lunarMonth === 1) {
    // Very simplified: assume middle of range
    const estimatedDay = lunarDay + 20;
    const solarDate = new Date(lunarYear, 0, estimatedDay); // January + days
    return solarDate;
  }

  // For other months, add approximate offset
  const estimate = new Date(lunarYear, lunarMonth - 1 + 1, lunarDay + 15);
  return estimate;
}

/**
 * Solar to Lunar date conversion (simplified)
 */
export function solarToLunar(solarDate: Date): {
  day: number;
  month: number;
  year: number;
} {
  // This is a simplified approximation
  // For accurate conversion, use Hoàng Xuân Hãn algorithm or similar

  const day = solarDate.getDate();
  const month = solarDate.getMonth() + 1;
  const year = solarDate.getFullYear();

  // Simplified approximation (not accurate for all dates)
  const lunarMonth = month > 1 ? month - 1 : 12;
  const lunarYear = month > 1 ? year : year - 1;
  const lunarDay = day > 20 ? day - 20 : day + 10;

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
  };
}

/**
 * Get name of month in Vietnamese
 */
export function getMonthNameVN(month: number): string {
  const monthNames = [
    "tháng Giêng",
    "tháng Hai",
    "tháng Ba",
    "tháng Tư",
    "tháng Năm",
    "tháng Sáu",
    "tháng Bảy",
    "tháng Tám",
    "tháng Chín",
    "tháng Mười",
    "tháng Mười Một",
    "tháng Mười Hai",
  ];

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  return monthNames[month - 1];
}

/**
 * Get name of day in Vietnamese
 */
export function getDayNameVN(day: Date | number): string {
  const dayNames = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  let dayOfWeek: number;

  if (day instanceof Date) {
    dayOfWeek = day.getDay();
  } else if (typeof day === "number") {
    if (day < 0 || day > 6) {
      throw new Error("Day must be between 0 and 6");
    }
    dayOfWeek = day;
  } else {
    throw new Error("Invalid day parameter");
  }

  return dayNames[dayOfWeek];
}

/**
 * Check if date is a Vietnamese public holiday
 */
export function isVietnamHoliday(date: Date): boolean {
  const dateStr = formatDateISO(date);
  return dateStr in VIETNAMESE_HOLIDAYS_2024;
}

/**
 * Get holiday name if date is a holiday
 */
export function getHolidayName(date: Date): string | null {
  const dateStr = formatDateISO(date);
  return (
    VIETNAMESE_HOLIDAYS_2024[dateStr as keyof typeof VIETNAMESE_HOLIDAYS_2024] ||
    null
  );
}

/**
 * Calculate business days between two dates
 * Excludes weekends and Vietnamese holidays
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Skip Vietnamese holidays
      if (!isVietnamHoliday(currentDate)) {
        businessDays++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(startDate: Date, days: number): Date {
  let count = 0;
  const resultDate = new Date(startDate);

  if (days < 0) {
    throw new Error("Days must be non-negative");
  }

  while (count < days) {
    resultDate.setDate(resultDate.getDate() + 1);
    const dayOfWeek = resultDate.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isVietnamHoliday(resultDate)) {
      count++;
    }
  }

  return resultDate;
}

/**
 * Get fiscal quarter from date
 * Vietnam's fiscal year = calendar year
 */
export function getFiscalQuarter(date: Date): number {
  const month = date.getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

/**
 * Get fiscal year
 */
export function getFiscalYear(date: Date): number {
  return date.getFullYear();
}

export default {
  formatDateVN,
  formatDateDDMMYYYY,
  formatDateISO,
  formatDateTimeVN,
  parseVNDate,
  lunarToSolar,
  solarToLunar,
  getMonthNameVN,
  getDayNameVN,
  isVietnamHoliday,
  getHolidayName,
  calculateBusinessDays,
  addBusinessDays,
  getFiscalQuarter,
  getFiscalYear,
};
