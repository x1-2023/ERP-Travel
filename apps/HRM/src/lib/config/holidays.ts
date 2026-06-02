// VN Public Holidays per year
// Based on Vietnam Labor Code 2019, Article 112
// Lunar holidays (Tet) dates vary by year — must be updated annually

interface HolidayEntry {
  date: string // "MM-DD" format
  name: string
}

// Fixed holidays (same every year)
const FIXED_HOLIDAYS: HolidayEntry[] = [
  { date: "01-01", name: "Tết Dương lịch" },
  { date: "04-30", name: "Ngày Giải phóng" },
  { date: "05-01", name: "Ngày Quốc tế Lao động" },
  { date: "09-02", name: "Ngày Quốc khánh" },
  { date: "09-03", name: "Ngày Quốc khánh (nghỉ bù)" },
]

// Lunar-based holidays that change each year (Tet + Hung Kings)
// Must update these when the next year's calendar is confirmed
const LUNAR_HOLIDAYS: Record<number, HolidayEntry[]> = {
  2025: [
    { date: "01-27", name: "Tết Nguyên đán (29 Tết)" },
    { date: "01-28", name: "Tết Nguyên đán (30 Tết)" },
    { date: "01-29", name: "Tết Nguyên đán (Mùng 1)" },
    { date: "01-30", name: "Tết Nguyên đán (Mùng 2)" },
    { date: "01-31", name: "Tết Nguyên đán (Mùng 3)" },
    { date: "04-07", name: "Giỗ Tổ Hùng Vương (10/3 ÂL)" },
  ],
  2026: [
    { date: "02-16", name: "Tết Nguyên đán (29 Tết)" },
    { date: "02-17", name: "Tết Nguyên đán (30 Tết)" },
    { date: "02-18", name: "Tết Nguyên đán (Mùng 1)" },
    { date: "02-19", name: "Tết Nguyên đán (Mùng 2)" },
    { date: "02-20", name: "Tết Nguyên đán (Mùng 3)" },
    { date: "04-26", name: "Giỗ Tổ Hùng Vương (10/3 ÂL)" },
  ],
  2027: [
    { date: "02-05", name: "Tết Nguyên đán (29 Tết)" },
    { date: "02-06", name: "Tết Nguyên đán (30 Tết)" },
    { date: "02-07", name: "Tết Nguyên đán (Mùng 1)" },
    { date: "02-08", name: "Tết Nguyên đán (Mùng 2)" },
    { date: "02-09", name: "Tết Nguyên đán (Mùng 3)" },
    { date: "04-15", name: "Giỗ Tổ Hùng Vương (10/3 ÂL)" },
  ],
}

/**
 * Get all VN public holiday dates for a given month/year.
 * Returns Set of "YYYY-MM-DD" strings for quick lookup.
 */
export function getHolidaysInMonth(month: number, year: number): Set<string> {
  const holidays = new Set<string>()
  const mm = String(month).padStart(2, "0")

  // Fixed holidays
  for (const h of FIXED_HOLIDAYS) {
    if (h.date.startsWith(mm + "-")) {
      holidays.add(`${year}-${h.date}`)
    }
  }

  // Lunar holidays for the year
  const lunarForYear = LUNAR_HOLIDAYS[year]
  if (lunarForYear) {
    for (const h of lunarForYear) {
      if (h.date.startsWith(mm + "-")) {
        holidays.add(`${year}-${h.date}`)
      }
    }
  }

  return holidays
}

/**
 * Calculate standard working days for a month, excluding weekends AND public holidays.
 */
export function calculateStandardDays(month: number, year: number): number {
  const holidays = getHolidaysInMonth(month, year)
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  let standardDays = 0
  const dd = new Date(startOfMonth)
  while (dd <= endOfMonth) {
    const dayOfWeek = dd.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Weekday — check if it's a public holiday
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`
      if (!holidays.has(dateStr)) {
        standardDays++
      }
    }
    dd.setDate(dd.getDate() + 1)
  }

  return standardDays
}
