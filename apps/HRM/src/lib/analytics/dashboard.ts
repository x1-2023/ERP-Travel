import { prisma } from "@/lib/prisma"
import { addDays, subMonths, startOfMonth, endOfMonth } from "date-fns"

export async function getDashboardMetrics() {
  const now = new Date()
  const monthStart = startOfMonth(now)

  // Run queries in parallel
  const [
    totalActive,
    totalProbation,
    newThisMonth,
    expiring30,
    expiring7,
    openReqs,
    pendingApps,
    pendingL1,
    pendingL2,
    activeOnboarding,
    byDepartment,
  ] = await Promise.all([
    // Employees
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "PROBATION" } }),
    prisma.employee.count({
      where: { status: { in: ["ACTIVE", "PROBATION"] }, startDate: { gte: monthStart } },
    }),

    // Contracts
    prisma.contract.count({
      where: {
        status: "ACTIVE",
        officialTo: { gte: now, lte: addDays(now, 30) },
      },
    }),
    prisma.contract.count({
      where: {
        status: "ACTIVE",
        officialTo: { gte: now, lte: addDays(now, 7) },
      },
    }),

    // Recruitment
    prisma.jobRequisition.count({ where: { status: "OPEN" } }).catch(() => 0),
    prisma.application.count({
      where: { status: { in: ["NEW", "SCREENING", "INTERVIEW"] } },
    }).catch(() => 0),

    // Reports
    prisma.report.count({ where: { status: "SUBMITTED" } }),
    prisma.report.count({ where: { status: "APPROVED_L1" } }),

    // Onboarding — count checklists that have incomplete tasks
    prisma.onboardingChecklist.count({
      where: { completedAt: null },
    }).catch(() => 0),

    // Department headcount
    prisma.department.findMany({
      select: {
        name: true,
        _count: { select: { employees: { where: { status: { in: ["ACTIVE", "PROBATION"] } } } } },
      },
      orderBy: { employees: { _count: "desc" } },
    }),
  ])

  // Detail lists for expandable cards
  const [
    activeEmployeesList,
    probationEmployeesList,
    openReqsList,
    onboardingList,
  ] = await Promise.all([
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } } },
      orderBy: { fullName: "asc" },
      take: 10,
    }),
    prisma.employee.findMany({
      where: { status: "PROBATION" },
      select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } }, startDate: true },
      orderBy: { startDate: "desc" },
      take: 10,
    }),
    prisma.jobRequisition.findMany({
      where: { status: "OPEN" },
      select: { id: true, title: true, department: { select: { name: true } }, headcount: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => [] as { id: string; title: string; department: { name: string }; headcount: number }[]),
    prisma.onboardingChecklist.findMany({
      where: { completedAt: null },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
      take: 10,
    }).catch(() => [] as { id: string; employee: { fullName: string; employeeCode: string } }[]),
  ])

  // Payroll summary
  const currentPayroll = await getCurrentPayrollSummary(now.getMonth() + 1, now.getFullYear())

  // Headcount trend (6 months)
  const headcountTrend = await getMonthlyHeadcountTrend(6)

  // Expiring contracts details
  const expiringContracts = await prisma.contract.findMany({
    where: {
      status: "ACTIVE",
      officialTo: { gte: now, lte: addDays(now, 30) },
    },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
    orderBy: { officialTo: "asc" },
    take: 10,
  })

  // Pending reports details
  const pendingReports = await prisma.report.findMany({
    where: { status: { in: ["SUBMITTED", "APPROVED_L1"] } },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
    orderBy: { submittedAt: "asc" },
    take: 10,
  })

  return {
    totalActive,
    totalProbation,
    newThisMonth,
    expiring30,
    expiring7,
    openReqs,
    pendingApps,
    pendingL1,
    pendingL2,
    currentPayroll,
    activeOnboarding,
    byDepartment: byDepartment.map((d: { name: string; _count: { employees: number } }) => ({
      name: d.name,
      count: d._count.employees,
    })),
    headcountTrend,
    expiringContracts: expiringContracts.map((c) => ({
      id: c.id,
      employeeName: c.employee.fullName,
      employeeCode: c.employee.employeeCode,
      expiryDate: c.officialTo!.toISOString(),
      daysLeft: Math.ceil((c.officialTo!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    })),
    pendingReports: pendingReports.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      employeeName: r.employee.fullName,
      employeeCode: r.employee.employeeCode,
      startDate: r.startDate.toISOString(),
    })),
    activeEmployeesList: activeEmployeesList.map((e) => ({
      id: e.id,
      name: e.fullName,
      code: e.employeeCode,
      department: e.department?.name ?? "",
    })),
    probationEmployeesList: probationEmployeesList.map((e) => ({
      id: e.id,
      name: e.fullName,
      code: e.employeeCode,
      department: e.department?.name ?? "",
      startDate: e.startDate?.toISOString() ?? "",
    })),
    openReqsList: openReqsList.map((r) => ({
      id: r.id,
      title: r.title,
      department: ("department" in r && r.department) ? (r.department as { name: string }).name : "",
      positions: ("headcount" in r) ? (r as { headcount: number }).headcount : 0,
    })),
    onboardingList: onboardingList.map((o) => ({
      id: o.id,
      name: o.employee.fullName,
      code: o.employee.employeeCode,
    })),
  }
}

async function getCurrentPayrollSummary(month: number, year: number) {
  const period = await prisma.payrollPeriod.findUnique({
    where: { month_year: { month, year } },
  })
  if (!period) return { status: "NONE", totalNet: 0, totalCost: 0, employeeCount: 0 }

  const agg = await prisma.employeePayroll.aggregate({
    where: { periodId: period.id },
    _sum: { netSalary: true, totalEmployerIns: true, totalActualSalary: true },
    _count: { id: true },
  })

  return {
    status: period.status,
    employeeCount: agg._count.id,
    totalNet: Number(agg._sum.netSalary ?? 0),
    totalCost: Number(agg._sum.totalActualSalary ?? 0) + Number(agg._sum.totalEmployerIns ?? 0),
  }
}

async function getMonthlyHeadcountTrend(months: number) {
  const now = new Date()
  const result: { month: string; count: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const end = endOfMonth(date)

    const count = await prisma.employee.count({
      where: {
        startDate: { lte: end },
        OR: [
          { status: { in: ["ACTIVE", "PROBATION"] } },
          { updatedAt: { gt: end } },
        ],
      },
    })

    result.push({
      month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
      count,
    })
  }

  return result
}
