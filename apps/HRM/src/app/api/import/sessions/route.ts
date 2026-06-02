import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const sessions = await prisma.importSession.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        importer: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Import sessions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi tải danh sách" },
      { status: 500 }
    )
  }
}
