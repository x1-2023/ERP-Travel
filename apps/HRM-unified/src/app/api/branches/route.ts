import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { branchService } from "@/services/branch.service"
import { audit } from "@/lib/audit/logger"
import { createBranchSchema } from "@/lib/validations/branch"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branches = await branchService.findAll(session.user.tenantId)
    return NextResponse.json(branches)
  } catch (error) {
    console.error("GET /api/branches error:", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách chi nhánh" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = createBranchSchema.parse(body)

    const branch = await branchService.create(session.user.tenantId, validated)

    await audit.create({ tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }, 'Branch', branch.id)

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error("POST /api/branches error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Không thể tạo chi nhánh" },
      { status: 500 }
    )
  }
}
