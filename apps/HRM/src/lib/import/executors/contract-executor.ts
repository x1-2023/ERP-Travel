import { prisma } from "@/lib/prisma"
import { parseDate, parseCurrency, parseContractType } from "../parsers"
import type { ColumnMapping } from "@/lib/ai/import-mapper"
import { applyMapping, type ImportError } from "../validators"

interface ExecutorResult {
  importedIds: string[]
  errors: ImportError[]
  successCount: number
}

export async function executeContractImport(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping
): Promise<ExecutorResult> {
  const mappedRows = applyMapping(rawRows, mapping)
  const errors: ImportError[] = []
  const importedIds: string[] = []

  await prisma.$transaction(
    async (tx) => {
      const employees = await tx.employee.findMany({
        select: { id: true, employeeCode: true, fullName: true },
      })
      const empByCode = new Map(employees.map((e) => [e.employeeCode, e]))
      const empByName = new Map(employees.map((e) => [e.fullName.toLowerCase(), e]))

      for (let i = 0; i < mappedRows.length; i++) {
        const row = mappedRows[i]
        const rowNum = i + 2

        try {
          const code = row.employeeCode ? String(row.employeeCode).trim() : ""
          const name = row.employeeName ? String(row.employeeName).trim().toLowerCase() : ""
          const emp = code ? empByCode.get(code) : empByName.get(name)

          if (!emp) {
            errors.push({ row: rowNum, field: "employeeCode", message: `Không tìm thấy NV: "${code || row.employeeName}"`, severity: "error" })
            continue
          }

          const contractType = parseContractType(row.contractType)
          if (!contractType) {
            errors.push({ row: rowNum, field: "contractType", message: `Loại HĐ không hợp lệ: "${row.contractType}"`, severity: "error" })
            continue
          }

          const contract = await tx.contract.create({
            data: {
              employeeId: emp.id,
              contractNo: row.contractNo ? String(row.contractNo).trim() : undefined,
              probationNo: row.probationNo ? String(row.probationNo).trim() : undefined,
              type: contractType,
              status: "ACTIVE",
              probationFrom: row.probationFrom ? parseDate(row.probationFrom) : undefined,
              probationTo: row.probationTo ? parseDate(row.probationTo) : undefined,
              officialFrom: row.officialFrom ? parseDate(row.officialFrom) : undefined,
              officialTo: row.officialTo ? parseDate(row.officialTo) : undefined,
              baseSalary: parseCurrency(row.baseSalary),
              mealAllowance: parseCurrency(row.mealAllowance),
              phoneAllowance: parseCurrency(row.phoneAllowance),
              fuelAllowance: parseCurrency(row.fuelAllowance),
              perfAllowance: parseCurrency(row.perfAllowance),
              kpiAmount: parseCurrency(row.kpiAmount),
              notes: row.notes ? String(row.notes) : undefined,
            },
          })
          importedIds.push(contract.id)
        } catch (error) {
          errors.push({
            row: rowNum,
            field: "general",
            message: error instanceof Error ? error.message : "Lỗi không xác định",
            severity: "error",
          })
        }
      }
    },
    { timeout: 120000 }
  )

  return { importedIds, errors, successCount: importedIds.length }
}
