import { prisma } from "@/lib/prisma"
import { parseCurrency } from "../parsers"
import type { ColumnMapping } from "@/lib/ai/import-mapper"
import { applyMapping, type ImportError } from "../validators"

interface ExecutorResult {
  importedIds: string[]
  createdPeriodIds: string[]
  errors: ImportError[]
  successCount: number
}

export async function executePayrollImport(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping,
  userId: string
): Promise<ExecutorResult> {
  const mappedRows = applyMapping(rawRows, mapping)
  const errors: ImportError[] = []
  const importedIds: string[] = []
  const createdPeriodIds: string[] = []

  await prisma.$transaction(
    async (tx) => {
      // Cache employees
      const employees = await tx.employee.findMany({
        select: { id: true, employeeCode: true, fullName: true },
      })
      const empByCode = new Map(employees.map((e) => [e.employeeCode, e]))
      const empByName = new Map(employees.map((e) => [e.fullName.toLowerCase(), e]))

      // Cache periods
      const periodCache = new Map<string, string>()

      for (let i = 0; i < mappedRows.length; i++) {
        const row = mappedRows[i]
        const rowNum = i + 2

        try {
          // Find employee
          const code = row.employeeCode ? String(row.employeeCode).trim() : ""
          const name = row.employeeName ? String(row.employeeName).trim().toLowerCase() : ""
          const emp = code ? empByCode.get(code) : empByName.get(name)

          if (!emp) {
            errors.push({ row: rowNum, field: "employeeCode", message: `Không tìm thấy NV: "${code || row.employeeName}"`, severity: "error" })
            continue
          }

          const month = Number(row.month)
          const year = Number(row.year)
          if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
            errors.push({ row: rowNum, field: "month", message: "Tháng/Năm không hợp lệ", severity: "error" })
            continue
          }

          // Find or create period
          const periodKey = `${month}-${year}`
          let periodId = periodCache.get(periodKey)
          if (!periodId) {
            let period = await tx.payrollPeriod.findUnique({
              where: { month_year: { month, year } },
            })
            if (!period) {
              period = await tx.payrollPeriod.create({
                data: { month, year, status: "DRAFT", createdBy: userId },
              })
              createdPeriodIds.push(period.id)
            }
            periodId = period.id
            periodCache.set(periodKey, periodId)
          }

          const baseSalary = parseCurrency(row.baseSalary) || 0
          const mealAllowance = parseCurrency(row.mealAllowance) || 0
          const phoneAllowance = parseCurrency(row.phoneAllowance) || 0
          const fuelAllowance = parseCurrency(row.fuelAllowance) || 0
          const perfAllowance = parseCurrency(row.perfAllowance) || 0
          const actualDays = Number(row.actualDays) || 22
          const standardDays = Number(row.standardDays) || 22

          const totalContractSalary = baseSalary + mealAllowance + phoneAllowance + fuelAllowance + perfAllowance
          const totalActualSalary = standardDays > 0 ? (totalContractSalary * actualDays) / standardDays : 0

          // Insurance calculations
          const insuranceBase = baseSalary
          const bhxhEmployee = insuranceBase * 0.08
          const bhytEmployee = insuranceBase * 0.015
          const bhtnEmployee = insuranceBase * 0.01
          const totalEmployeeIns = bhxhEmployee + bhytEmployee + bhtnEmployee
          const totalIncome = totalActualSalary
          const taxableIncome = Math.max(0, totalIncome - totalEmployeeIns - 11000000)
          const pitAmount = taxableIncome > 0 ? taxableIncome * 0.05 : 0
          const netSalary = totalActualSalary - totalEmployeeIns - pitAmount

          const bhxhEmployer = insuranceBase * 0.175
          const bhytEmployer = insuranceBase * 0.03
          const bhtnEmployer = insuranceBase * 0.01
          const bhtnldEmployer = insuranceBase * 0.005
          const totalEmployerIns = bhxhEmployer + bhytEmployer + bhtnEmployer + bhtnldEmployer

          const empPayroll = await tx.employeePayroll.create({
            data: {
              periodId,
              employeeId: emp.id,
              actualDays,
              standardDays,
              baseSalary,
              mealAllowance,
              phoneAllowance,
              fuelAllowance,
              perfAllowance,
              totalContractSalary,
              totalActualSalary,
              personalDeduction: 11000000,
              dependentCount: 0,
              dependentDeduction: 0,
              totalIncome,
              taxableIncome,
              insuranceBase,
              bhxhEmployee,
              bhytEmployee,
              bhtnEmployee,
              totalEmployeeIns,
              pitAmount,
              netSalary,
              bhxhEmployer,
              bhytEmployer,
              bhtnEmployer,
              bhtnldEmployer,
              totalEmployerIns,
              notes: row.notes ? String(row.notes) : undefined,
            },
          })
          importedIds.push(empPayroll.id)
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Lỗi không xác định"
          if (msg.includes("Unique constraint")) {
            errors.push({ row: rowNum, field: "general", message: "Bản ghi lương đã tồn tại cho NV này trong kỳ", severity: "error" })
          } else {
            errors.push({ row: rowNum, field: "general", message: msg, severity: "error" })
          }
        }
      }
    },
    { timeout: 120000 }
  )

  return { importedIds, createdPeriodIds, errors, successCount: importedIds.length }
}
