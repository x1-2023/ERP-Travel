import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/calculators/payroll"

/**
 * Sync active dependent count to current DRAFT payroll (preserves existing OT/KPI data)
 */
export async function syncDependentCount(employeeId: string): Promise<number> {
  const activeCount = await prisma.dependent.count({
    where: { employeeId, isActive: true },
  })

  const now = new Date()
  const period = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month: now.getMonth() + 1, year: now.getFullYear() } },
  })

  if (period && period.status === "DRAFT") {
    const ep = await prisma.employeePayroll.findUnique({
      where: { periodId_employeeId: { periodId: period.id, employeeId } },
      include: { items: true },
    })

    if (ep && !ep.isLocked) {
      // Sum existing PayrollItems by type (preserve OT/KPI data)
      const itemsByType: Record<string, number> = {}
      for (const item of ep.items) {
        itemsByType[item.type] = (itemsByType[item.type] ?? 0) + Number(item.amount)
      }

      const result = calculatePayroll({
        baseSalary: Number(ep.baseSalary),
        mealAllowance: Number(ep.mealAllowance),
        phoneAllowance: Number(ep.phoneAllowance),
        fuelAllowance: Number(ep.fuelAllowance),
        perfAllowance: Number(ep.perfAllowance),
        actualDays: Number(ep.actualDays),
        standardDays: Number(ep.standardDays),
        otWeekday: itemsByType["OT_WEEKDAY"] ?? 0,
        otWeekend: itemsByType["OT_WEEKEND"] ?? 0,
        otHoliday: itemsByType["OT_HOLIDAY"] ?? 0,
        nightShift: itemsByType["NIGHT_SHIFT"] ?? 0,
        businessTrip: itemsByType["BUSINESS_TRIP"] ?? 0,
        hazardAllowance: itemsByType["HAZARD_ALLOWANCE"] ?? 0,
        otherAllowance: itemsByType["OTHER_ALLOWANCE"] ?? 0,
        kpiCurrent: itemsByType["KPI_CURRENT"] ?? 0,
        kpiPrev1: itemsByType["KPI_PREV1"] ?? 0,
        kpiPrev2: itemsByType["KPI_PREV2"] ?? 0,
        advanceDeduction: Number(ep.advanceDeduction),
        dependentCount: activeCount,
        isProbation: false,
      })

      await prisma.employeePayroll.update({
        where: { id: ep.id },
        data: {
          dependentCount: activeCount,
          ...result,
        },
      })
    }
  }

  return activeCount
}
