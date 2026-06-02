import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/kpi — List KPI periods
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const periods = await prisma.kPIPeriod.findMany({
    include: {
      _count: { select: { scores: true } },
      scores: { select: { score: true, kpiAmount: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })

  const data = periods.map((p) => {
    const avgScore =
      p.scores.length > 0
        ? p.scores.reduce((s, sc) => s + Number(sc.score), 0) / p.scores.length
        : 0
    const totalKpi = p.scores.reduce((s, sc) => s + Number(sc.kpiAmount), 0)
    return {
      id: p.id,
      month: p.month,
      year: p.year,
      status: p.status,
      scoreCount: p._count.scores,
      avgScore: Math.round(avgScore * 10) / 10,
      totalKpi,
      createdAt: p.createdAt,
    }
  })

  return NextResponse.json({ data })
}

// POST /api/kpi — Create KPI period
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!["SUPER_ADMIN", "HR_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { month, year, notes } = body

  if (!month || !year || month < 1 || month > 12) {
    return NextResponse.json({ error: "Tháng/năm không hợp lệ" }, { status: 400 })
  }

  const existing = await prisma.kPIPeriod.findUnique({
    where: { month_year: { month, year } },
  })

  if (existing) {
    return NextResponse.json({ error: `KPI tháng ${month}/${year} đã tồn tại` }, { status: 409 })
  }

  const period = await prisma.kPIPeriod.create({
    data: {
      month,
      year,
      notes,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ data: period }, { status: 201 })
}
