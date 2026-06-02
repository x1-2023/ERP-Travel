import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/reports/[reportId]/cancel — DRAFT → CANCELLED
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reportId } = await params

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) {
    return NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 })
  }
  if (report.status !== "DRAFT") {
    return NextResponse.json({ error: "Chỉ có thể hủy báo cáo ở trạng thái DRAFT" }, { status: 400 })
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: "CANCELLED" },
  })

  await prisma.reportActivity.create({
    data: {
      reportId,
      actorId: session.user.id,
      actorRole: session.user.role,
      action: "CANCELLED",
    },
  })

  return NextResponse.json({ data: updated })
}
