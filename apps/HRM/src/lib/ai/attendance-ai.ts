/**
 * AI Attendance Intelligence
 *
 * 1. Anomaly Detection — Phát hiện bất thường chấm công
 * 2. Smart Sync — Gợi ý OT/nghỉ phép tự động khi sync payroll
 * 3. Auto-Map Columns — Nhận dạng cột file chấm công lạ
 * 4. Attendance Forecast — Dự báo nhân lực
 */
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"
import { DAY_VALUES } from "@/lib/config/attendance"

// ═══════════════ TYPES ═══════════════

export interface AnomalyRecord {
  employeeId: string
  employeeCode: string
  employeeName: string
  department: string
  type: AnomalyType
  severity: "high" | "medium" | "low"
  description: string
  dates: string[]
  suggestion: string
}

export type AnomalyType =
  | "frequent_late"        // Đi muộn liên tục (>= 5 lần/tháng)
  | "frequent_absent"      // Vắng nhiều (>= 3 lần/tháng)
  | "pattern_absence"      // Pattern nghỉ (thứ 2/6 liên tục)
  | "short_hours"          // Giờ làm ngắn liên tục (< 6h)
  | "early_checkout"       // Check-out sớm liên tục (< 16:30)
  | "overtime_unrecorded"  // OT không được ghi nhận (checkout > 19:00)
  | "no_checkout"          // Check-in nhưng không check-out

export interface SmartSyncSuggestion {
  employeeId: string
  employeeCode: string
  employeeName: string
  type: "auto_ot" | "auto_leave" | "low_attendance" | "missing_records"
  description: string
  actionLabel: string
  data: Record<string, unknown>
}

export interface ForecastResult {
  department: string
  departmentId: string
  date: string
  dayOfWeek: string
  predictedPresent: number
  totalEmployees: number
  riskLevel: "high" | "medium" | "low"
  riskFactors: string[]
}

// ═══════════════ 1. ANOMALY DETECTION ═══════════════

export async function detectAnomalies(
  month: number,
  year: number
): Promise<AnomalyRecord[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0))

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          fullName: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  })

  // Group by employee
  const byEmployee = new Map<string, typeof records>()
  for (const rec of records) {
    const key = rec.employeeId
    if (!byEmployee.has(key)) byEmployee.set(key, [])
    byEmployee.get(key)!.push(rec)
  }

  const anomalies: AnomalyRecord[] = []

  type AttRecord = typeof records[number]

  const entries = Array.from(byEmployee.entries())
  for (const [empId, empRecords] of entries) {
    const emp = empRecords[0].employee
    const dept = emp.department?.name || "N/A"

    // Count by status
    const lateDays = empRecords.filter((r: AttRecord) => r.status === "LATE")
    const absentDays = empRecords.filter((r: AttRecord) => r.status === "ABSENT")

    // 1. Frequent late (>= 5 days)
    if (lateDays.length >= 5) {
      anomalies.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: dept,
        type: "frequent_late",
        severity: lateDays.length >= 8 ? "high" : "medium",
        description: `Đi muộn ${lateDays.length} ngày trong tháng ${month}/${year}`,
        dates: lateDays.map((r: AttRecord) => r.date.toISOString().split("T")[0]),
        suggestion: "Nhắc nhở nhân viên, cân nhắc ghi nhận kỷ luật nếu tái diễn",
      })
    }

    // 2. Frequent absent (>= 3 days)
    if (absentDays.length >= 3) {
      anomalies.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: dept,
        type: "frequent_absent",
        severity: absentDays.length >= 5 ? "high" : "medium",
        description: `Vắng mặt ${absentDays.length} ngày không phép`,
        dates: absentDays.map((r: AttRecord) => r.date.toISOString().split("T")[0]),
        suggestion: "Liên hệ nhân viên xác nhận lý do, tạo đơn nghỉ phép nếu cần",
      })
    }

    // 3. Pattern absence (Monday/Friday pattern)
    const absentByDow = new Map<number, number>()
    for (const r of [...absentDays, ...empRecords.filter((r: AttRecord) => r.status === "LEAVE")]) {
      const dow = r.date.getUTCDay()
      absentByDow.set(dow, (absentByDow.get(dow) || 0) + 1)
    }
    const mondayAbsent = absentByDow.get(1) || 0
    const fridayAbsent = absentByDow.get(5) || 0
    if (mondayAbsent >= 3 || fridayAbsent >= 3) {
      const patternDay = mondayAbsent >= fridayAbsent ? "Thứ Hai" : "Thứ Sáu"
      anomalies.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: dept,
        type: "pattern_absence",
        severity: "medium",
        description: `Nghỉ ${patternDay} ${Math.max(mondayAbsent, fridayAbsent)} lần — có thể là pattern`,
        dates: [],
        suggestion: "Theo dõi pattern, trao đổi với nhân viên nếu cần",
      })
    }

    // 4. Short work hours (< 6h average when present)
    const presentRecords = empRecords.filter((r: AttRecord) =>
      ["PRESENT", "LATE"].includes(r.status) && r.workHours
    )
    if (presentRecords.length >= 5) {
      const avgHours = presentRecords.reduce((s: number, r: AttRecord) => s + Number(r.workHours || 0), 0) / presentRecords.length
      if (avgHours < 6) {
        anomalies.push({
          employeeId: empId,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          department: dept,
          type: "short_hours",
          severity: avgHours < 4 ? "high" : "low",
          description: `Giờ làm trung bình chỉ ${avgHours.toFixed(1)}h/ngày (chuẩn: 8h)`,
          dates: presentRecords.filter((r: AttRecord) => Number(r.workHours) < 6).map((r: AttRecord) => r.date.toISOString().split("T")[0]),
          suggestion: "Kiểm tra lại dữ liệu chấm công, có thể thiếu check-out",
        })
      }
    }

    // 5. Overtime unrecorded (checkout > 19:00)
    const otRecords = presentRecords.filter((r: AttRecord) => {
      if (!r.checkOutAt) return false
      const hour = r.checkOutAt.getUTCHours()
      return hour >= 19
    })
    if (otRecords.length >= 3) {
      anomalies.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: dept,
        type: "overtime_unrecorded",
        severity: "medium",
        description: `Check-out sau 19:00 có ${otRecords.length} ngày — có thể là OT chưa được ghi nhận`,
        dates: otRecords.map((r: AttRecord) => r.date.toISOString().split("T")[0]),
        suggestion: "Tạo đơn tăng ca cho nhân viên hoặc xác nhận với quản lý",
      })
    }

    // 6. No checkout (check-in but no check-out)
    const noCheckout = empRecords.filter((r: AttRecord) => r.checkInAt && !r.checkOutAt)
    if (noCheckout.length >= 3) {
      anomalies.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        department: dept,
        type: "no_checkout",
        severity: "low",
        description: `${noCheckout.length} ngày có check-in nhưng không check-out`,
        dates: noCheckout.map((r: AttRecord) => r.date.toISOString().split("T")[0]),
        suggestion: "HR chỉnh sửa giờ check-out dựa trên thực tế",
      })
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return anomalies
}

// ═══════════════ 2. SMART SYNC SUGGESTIONS ═══════════════

export async function getSmartSyncSuggestions(
  month: number,
  year: number
): Promise<SmartSyncSuggestion[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0))

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      employee: { status: { in: ["ACTIVE", "PROBATION"] } },
    },
    include: {
      employee: {
        select: { id: true, employeeCode: true, fullName: true },
      },
    },
  })

  // Check existing reports for this period
  const existingReports = await prisma.report.findMany({
    where: {
      startDate: { gte: startDate },
      endDate: { lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: { employeeId: true, type: true, startDate: true, endDate: true },
  })

  const reportMap = new Map<string, typeof existingReports>()
  for (const r of existingReports) {
    if (!reportMap.has(r.employeeId)) reportMap.set(r.employeeId, [])
    reportMap.get(r.employeeId)!.push(r)
  }

  const suggestions: SmartSyncSuggestion[] = []
  const byEmployee = new Map<string, typeof records>()
  for (const rec of records) {
    if (!byEmployee.has(rec.employeeId)) byEmployee.set(rec.employeeId, [])
    byEmployee.get(rec.employeeId)!.push(rec)
  }

  // Count working days in month (Mon-Fri)
  let workingDays = 0
  for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = d.getUTCDay()
    if (dow !== 0 && dow !== 6) workingDays++
  }

  type SyncRecord = typeof records[number]
  const syncEntries = Array.from(byEmployee.entries())
  for (const [empId, empRecords] of syncEntries) {
    const emp = empRecords[0].employee
    const empReports = reportMap.get(empId) || []

    // Auto OT detection: checkout >= 19:00 without existing OT report
    const otDays = empRecords.filter((r: SyncRecord) => {
      if (!r.checkOutAt) return false
      const hour = r.checkOutAt.getUTCHours()
      if (hour < 19) return false
      // Check if OT report already exists for this date
      const dateStr = r.date.toISOString().split("T")[0]
      return !empReports.some(rep =>
        rep.type === "OVERTIME" &&
        rep.startDate.toISOString().split("T")[0] <= dateStr &&
        rep.endDate.toISOString().split("T")[0] >= dateStr
      )
    })

    if (otDays.length > 0) {
      const totalOtHours = otDays.reduce((sum: number, r: SyncRecord) => {
        const hours = Number(r.workHours || 0)
        return sum + Math.max(0, hours - 8)
      }, 0)

      suggestions.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        type: "auto_ot",
        description: `${otDays.length} ngày check-out sau 19:00, ~${totalOtHours.toFixed(1)}h OT chưa tạo đơn`,
        actionLabel: "Tạo đơn tăng ca",
        data: {
          dates: otDays.map((r: SyncRecord) => r.date.toISOString().split("T")[0]),
          estimatedHours: totalOtHours,
        },
      })
    }

    // Auto leave detection: absent/leave days without leave report
    const absentDays = empRecords.filter((r: SyncRecord) => {
      if (r.status !== "ABSENT" && r.status !== "LEAVE") return false
      const dateStr = r.date.toISOString().split("T")[0]
      return !empReports.some(rep =>
        ["LEAVE_PAID", "LEAVE_UNPAID", "LEAVE_SICK"].includes(rep.type) &&
        rep.startDate.toISOString().split("T")[0] <= dateStr &&
        rep.endDate.toISOString().split("T")[0] >= dateStr
      )
    })

    if (absentDays.length > 0) {
      suggestions.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        type: "auto_leave",
        description: `${absentDays.length} ngày vắng/nghỉ chưa có đơn phép`,
        actionLabel: "Tạo đơn nghỉ phép",
        data: {
          dates: absentDays.map((r: SyncRecord) => r.date.toISOString().split("T")[0]),
        },
      })
    }

    // Low attendance warning
    const actualDays = empRecords.reduce((sum: number, r: SyncRecord) => {
      return sum + (DAY_VALUES[r.status] || 0)
    }, 0)

    if (actualDays < workingDays * 0.8 && empRecords.length > 0) {
      suggestions.push({
        employeeId: empId,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        type: "low_attendance",
        description: `Công thực tế: ${actualDays}/${workingDays} ngày (${Math.round(actualDays / workingDays * 100)}%)`,
        actionLabel: "Kiểm tra",
        data: { actualDays, workingDays, percentage: Math.round(actualDays / workingDays * 100) },
      })
    }
  }

  // Missing records: employees with no attendance data at all
  const allActiveEmployees = await prisma.employee.findMany({
    where: { status: { in: ["ACTIVE", "PROBATION"] } },
    select: { id: true, employeeCode: true, fullName: true },
  })

  const employeesWithRecords = new Set(byEmployee.keys())
  for (const emp of allActiveEmployees) {
    if (!employeesWithRecords.has(emp.id)) {
      suggestions.push({
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        type: "missing_records",
        description: `Không có dữ liệu chấm công tháng ${month}/${year}`,
        actionLabel: "Import chấm công",
        data: {},
      })
    }
  }

  return suggestions
}

// ═══════════════ 3. AI AUTO-MAP COLUMNS ═══════════════

export async function aiAutoMapAttendanceColumns(
  headers: string[],
  sampleRows: unknown[][]
): Promise<{
  format: string
  columnMap: Record<string, number>
  confidence: number
  explanation: string
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      format: "unknown",
      columnMap: {},
      confidence: 0,
      explanation: "ANTHROPIC_API_KEY chưa được cấu hình. Sử dụng auto-detect thông thường.",
    }
  }

  const anthropic = new Anthropic({ apiKey })

  const prompt = `Phân tích file chấm công với headers và dữ liệu mẫu sau.
Xác định:
1. Đây là file từ máy chấm công nào? (ZKTeco, Ronald Jack, Suprema, Hikvision, hoặc format khác)
2. Cột nào chứa: mã nhân viên, tên nhân viên, ngày, giờ vào, giờ ra
3. Format thời gian sử dụng

Headers: ${JSON.stringify(headers)}

Dữ liệu mẫu (3 dòng đầu):
${JSON.stringify(sampleRows.slice(0, 3))}

Trả về JSON CHÍNH XÁC (không markdown):
{
  "format": "tên máy hoặc format",
  "columnMap": {
    "employeeCode": 0,
    "employeeName": 1,
    "date": 2,
    "checkIn": 3,
    "checkOut": 4
  },
  "confidence": 0.95,
  "explanation": "Giải thích ngắn bằng tiếng Việt"
}

Lưu ý: columnMap dùng index (0-based) của headers. Nếu không tìm thấy cột thì bỏ qua field đó.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim()

    return JSON.parse(text)
  } catch (error) {
    console.error("AI auto-map error:", error)
    return {
      format: "unknown",
      columnMap: {},
      confidence: 0,
      explanation: `AI mapping thất bại: ${error instanceof Error ? error.message : "Unknown"}`,
    }
  }
}

// ═══════════════ 4. ATTENDANCE FORECAST ═══════════════

export async function forecastAttendance(
  targetWeekStart: Date
): Promise<ForecastResult[]> {
  // Get historical data (last 3 months)
  const threeMonthsAgo = new Date(targetWeekStart)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const historicalRecords = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: threeMonthsAgo, lt: targetWeekStart },
      employee: { status: { in: ["ACTIVE", "PROBATION"] } },
    },
    select: {
      employeeId: true,
      date: true,
      status: true,
    },
  })

  const departments = await prisma.department.findMany({
    include: {
      employees: {
        where: { status: { in: ["ACTIVE", "PROBATION"] } },
        select: { id: true },
      },
    },
  })

  // Calculate per-department, per-DOW absence rate
  const deptDowStats = new Map<string, Map<number, { total: number; absent: number }>>()

  for (const dept of departments) {
    const empIds = new Set(dept.employees.map((e: { id: string }) => e.id))
    const deptRecords = historicalRecords.filter((r: typeof historicalRecords[number]) => empIds.has(r.employeeId))

    const dowMap = new Map<number, { total: number; absent: number }>()
    for (const r of deptRecords) {
      const dow = r.date.getUTCDay()
      if (dow === 0 || dow === 6) continue
      if (!dowMap.has(dow)) dowMap.set(dow, { total: 0, absent: 0 })
      const s = dowMap.get(dow)!
      s.total++
      if (["ABSENT", "LEAVE", "HALF_DAY"].includes(r.status)) s.absent++
    }
    deptDowStats.set(dept.id, dowMap)
  }

  // Pending leave reports for target week
  const weekEnd = new Date(targetWeekStart)
  weekEnd.setDate(weekEnd.getDate() + 5) // Mon-Fri

  const pendingLeaves = await prisma.report.findMany({
    where: {
      type: { in: ["LEAVE_PAID", "LEAVE_UNPAID", "LEAVE_SICK", "LEAVE_MATERNITY"] },
      status: { in: ["SUBMITTED", "APPROVED_L1", "APPROVED_FINAL"] },
      startDate: { lte: weekEnd },
      endDate: { gte: targetWeekStart },
    },
    select: { employeeId: true, startDate: true, endDate: true },
  })

  const dowNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const results: ForecastResult[] = []

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const targetDate = new Date(targetWeekStart)
    targetDate.setDate(targetDate.getDate() + dayOffset)
    const dow = targetDate.getUTCDay()
    if (dow === 0 || dow === 6) continue

    for (const dept of departments) {
      const totalEmps = dept.employees.length
      if (totalEmps === 0) continue

      const dowStats = deptDowStats.get(dept.id)?.get(dow)
      const historicalAbsenceRate = dowStats && dowStats.total > 0
        ? dowStats.absent / dowStats.total
        : 0.05 // default 5%

      // Count approved leaves for this day
      const dateStr = targetDate.toISOString().split("T")[0]
      const leavesOnDay = pendingLeaves.filter(l => {
        const empInDept = dept.employees.some(e => e.id === l.employeeId)
        if (!empInDept) return false
        return l.startDate.toISOString().split("T")[0] <= dateStr &&
               l.endDate.toISOString().split("T")[0] >= dateStr
      }).length

      const predictedAbsent = Math.round(totalEmps * historicalAbsenceRate) + leavesOnDay
      const predictedPresent = Math.max(0, totalEmps - predictedAbsent)
      const absenceRate = predictedAbsent / totalEmps

      const riskFactors: string[] = []
      if (dow === 1) riskFactors.push("Thứ Hai — tỷ lệ nghỉ cao hơn bình thường")
      if (dow === 5) riskFactors.push("Thứ Sáu — tỷ lệ nghỉ cao hơn bình thường")
      if (leavesOnDay > 0) riskFactors.push(`${leavesOnDay} đơn nghỉ phép đã duyệt`)
      if (historicalAbsenceRate > 0.15) riskFactors.push(`Tỷ lệ vắng lịch sử: ${(historicalAbsenceRate * 100).toFixed(0)}%`)

      results.push({
        department: dept.name,
        departmentId: dept.id,
        date: dateStr,
        dayOfWeek: dowNames[dow],
        predictedPresent,
        totalEmployees: totalEmps,
        riskLevel: absenceRate > 0.2 ? "high" : absenceRate > 0.1 ? "medium" : "low",
        riskFactors,
      })
    }
  }

  return results
}

// ═══════════════ AI ANALYSIS (Claude-powered insights) ═══════════════

export async function aiAnalyzeAttendance(
  month: number,
  year: number,
  anomalies: AnomalyRecord[],
  suggestions: SmartSyncSuggestion[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return generateFallbackAnalysis(anomalies, suggestions)
  }

  const anthropic = new Anthropic({ apiKey })

  // Get summary stats
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0))

  const totalRecords = await prisma.attendanceRecord.count({
    where: { date: { gte: startDate, lte: endDate } },
  })

  const statusCounts = await prisma.attendanceRecord.groupBy({
    by: ["status"],
    where: { date: { gte: startDate, lte: endDate } },
    _count: true,
  })

  const prompt = `Phân tích dữ liệu chấm công tháng ${month}/${year} của công ty RTR Vietnam (70 nhân viên, sản xuất product).

THỐNG KÊ:
- Tổng bản ghi: ${totalRecords}
- Phân bố: ${statusCounts.map(s => `${s.status}: ${s._count}`).join(", ")}

BẤT THƯỜNG PHÁT HIỆN (${anomalies.length}):
${anomalies.slice(0, 15).map(a => `- [${a.severity}] ${a.employeeName} (${a.department}): ${a.description}`).join("\n")}

GỢI Ý SMART SYNC (${suggestions.length}):
${suggestions.slice(0, 10).map(s => `- ${s.employeeName}: ${s.description}`).join("\n")}

Hãy viết BÁO CÁO PHÂN TÍCH ngắn gọn (3-5 đoạn) bằng tiếng Việt, bao gồm:
1. Tổng quan tình hình chấm công
2. Các vấn đề cần lưu ý (nhóm theo mức nghiêm trọng)
3. Đề xuất hành động cụ thể cho HR
4. Xu hướng cần theo dõi

Giọng văn: chuyên nghiệp, ngắn gọn, đi thẳng vào vấn đề.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    return response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")
  } catch (error) {
    console.error("AI analysis error:", error)
    return generateFallbackAnalysis(anomalies, suggestions)
  }
}

function generateFallbackAnalysis(
  anomalies: AnomalyRecord[],
  suggestions: SmartSyncSuggestion[]
): string {
  const highCount = anomalies.filter(a => a.severity === "high").length
  const medCount = anomalies.filter(a => a.severity === "medium").length
  const otSuggestions = suggestions.filter(s => s.type === "auto_ot").length
  const leaveSuggestions = suggestions.filter(s => s.type === "auto_leave").length

  return `**Tổng quan:** Phát hiện ${anomalies.length} bất thường (${highCount} nghiêm trọng, ${medCount} trung bình).

**Vấn đề chính:**
${highCount > 0 ? `- ${highCount} trường hợp nghiêm trọng cần xử lý ngay` : "- Không có vấn đề nghiêm trọng"}
${medCount > 0 ? `- ${medCount} trường hợp cần theo dõi` : ""}

**Gợi ý:**
${otSuggestions > 0 ? `- ${otSuggestions} nhân viên có OT chưa được ghi nhận` : ""}
${leaveSuggestions > 0 ? `- ${leaveSuggestions} nhân viên vắng chưa có đơn phép` : ""}

*Cấu hình ANTHROPIC_API_KEY để nhận phân tích chi tiết từ AI.*`
}
