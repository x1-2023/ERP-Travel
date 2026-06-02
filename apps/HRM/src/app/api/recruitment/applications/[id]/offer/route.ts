import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const app = await prisma.application.findUnique({ where: { id } })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (app.status !== "INTERVIEW") {
    return NextResponse.json({ error: "Application must be in INTERVIEW status" }, { status: 400 })
  }

  if (!body.offeredSalary) {
    return NextResponse.json({ error: "offeredSalary is required" }, { status: 400 })
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: "OFFERED",
      offeredSalary: body.offeredSalary,
      offeredAt: new Date(),
      offerNote: body.offerNote || null,
      offerDeadline: body.offerDeadline ? new Date(body.offerDeadline) : null,
    },
  })

  return NextResponse.json(updated)
}
