import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/search?q=...&types=employees,contracts&limit=5
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get("q")?.trim() || ""
  const types = (searchParams.get("types") || "employees,contracts,reports,recruitment,advances").split(",")
  const limit = Math.min(10, Math.max(1, Number(searchParams.get("limit") || "5")))

  if (q.length < 2) {
    return NextResponse.json({
      employees: [],
      contracts: [],
      reports: [],
      recruitment: [],
      advances: [],
      totalCount: 0,
    })
  }

  const role = session.user.role
  const userId = session.user.id
  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(role)

  // For EMPLOYEE: find their employee ID
  let myEmployeeId: string | null = null
  if (!isHR) {
    const emp = await prisma.employee.findFirst({
      where: { userId },
      select: { id: true },
    })
    myEmployeeId = emp?.id || null
  }

  const results = await Promise.all([
    // Employees
    types.includes("employees")
      ? prisma.employee.findMany({
          where: {
            ...(isHR
              ? {
                  OR: [
                    { fullName: { contains: q, mode: "insensitive" } },
                    { employeeCode: { contains: q, mode: "insensitive" } },
                  ],
                }
              : { id: myEmployeeId || "none", fullName: { contains: q, mode: "insensitive" } }),
          },
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            status: true,
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
          take: limit,
          orderBy: { employeeCode: "asc" },
        })
      : [],

    // Contracts
    types.includes("contracts") && isHR
      ? prisma.contract.findMany({
          where: {
            OR: [
              { contractNo: { contains: q, mode: "insensitive" } },
              { employee: { fullName: { contains: q, mode: "insensitive" } } },
            ],
          },
          select: {
            id: true,
            contractNo: true,
            type: true,
            status: true,
            officialTo: true,
            employee: { select: { id: true, fullName: true } },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],

    // Reports
    types.includes("reports")
      ? prisma.report.findMany({
          where: {
            ...(isHR
              ? { employee: { fullName: { contains: q, mode: "insensitive" } } }
              : { employeeId: myEmployeeId || "none" }),
          },
          select: {
            id: true,
            type: true,
            status: true,
            startDate: true,
            employee: { select: { fullName: true } },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        }).catch(() => [])
      : [],

    // Recruitment (HR/Manager only)
    types.includes("recruitment") && ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF", "DEPT_MANAGER"].includes(role)
      ? prisma.jobRequisition.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { department: { name: { contains: q, mode: "insensitive" } } },
            ],
          },
          select: {
            id: true,
            title: true,
            status: true,
            department: { select: { name: true } },
            _count: { select: { applications: true } },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],

    // Advances
    types.includes("advances")
      ? prisma.salaryAdvance.findMany({
          where: {
            ...(isHR
              ? { employee: { fullName: { contains: q, mode: "insensitive" } } }
              : { employeeId: myEmployeeId || "none" }),
          },
          select: {
            id: true,
            amount: true,
            status: true,
            requestedAt: true,
            employee: { select: { fullName: true } },
          },
          take: limit,
          orderBy: { requestedAt: "desc" },
        })
      : [],
  ])

  const [employees, contracts, reports, recruitment, advances] = results

  const employeeResults = (employees as Array<{
    id: string; employeeCode: string; fullName: string; status: string;
    department: { name: string } | null; position: { name: string } | null
  }>).map((e) => ({
    id: e.id,
    employeeCode: e.employeeCode,
    fullName: e.fullName,
    department: e.department?.name || "",
    position: e.position?.name || "",
    status: e.status,
    avatarInitials: e.fullName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase(),
  }))

  const contractResults = (contracts as Array<{
    id: string; contractNo: string; type: string; status: string; officialTo: Date | null;
    employee: { id: string; fullName: string }
  }>).map((c) => ({
    id: c.id,
    contractNo: c.contractNo,
    employeeId: c.employee.id,
    employeeName: c.employee.fullName,
    type: c.type,
    status: c.status,
    officialTo: c.officialTo,
  }))

  const reportResults = (reports as Array<{
    id: string; type: string; status: string; startDate: Date | null;
    employee: { fullName: string }
  }>).map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    employeeName: r.employee.fullName,
    startDate: r.startDate,
  }))

  const recruitmentResults = (recruitment as Array<{
    id: string; title: string; status: string;
    department: { name: string }; _count: { applications: number }
  }>).map((r) => ({
    id: r.id,
    title: r.title,
    department: r.department.name,
    status: r.status,
    applicationCount: r._count.applications,
  }))

  const advanceResults = (advances as Array<{
    id: string; amount: unknown; status: string; requestedAt: Date;
    employee: { fullName: string }
  }>).map((a) => ({
    id: a.id,
    employeeName: a.employee.fullName,
    amount: Number(a.amount),
    status: a.status,
    requestedAt: a.requestedAt,
  }))

  const totalCount =
    employeeResults.length + contractResults.length + reportResults.length +
    recruitmentResults.length + advanceResults.length

  return NextResponse.json({
    employees: employeeResults,
    contracts: contractResults,
    reports: reportResults,
    recruitment: recruitmentResults,
    advances: advanceResults,
    totalCount,
  })
}
