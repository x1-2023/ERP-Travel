import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get("departmentId") || ""

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true }
  if (departmentId) {
    where.departmentId = departmentId
  }

  const positions = await prisma.position.findMany({
    where,
    select: { id: true, name: true, code: true, departmentId: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(positions)
}
