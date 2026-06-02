import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; contractId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "HR_MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only HR_MANAGER can activate contracts" }, { status: 403 })
  }

  const { id, contractId } = await params

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, employeeId: id },
  })
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (contract.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT contracts can be activated" }, { status: 400 })
  }

  // Validate required fields based on type
  if (contract.type === "PROBATION") {
    if (!contract.probationFrom || !contract.probationTo) {
      return NextResponse.json({ error: "Ngày thử việc chưa được điền" }, { status: 400 })
    }
  } else if (["DEFINITE_TERM", "INTERN"].includes(contract.type)) {
    if (!contract.officialFrom || !contract.officialTo) {
      return NextResponse.json({ error: "Ngày hợp đồng chưa được điền" }, { status: 400 })
    }
  } else if (contract.type === "INDEFINITE_TERM") {
    if (!contract.officialFrom) {
      return NextResponse.json({ error: "Ngày bắt đầu hợp đồng chưa được điền" }, { status: 400 })
    }
  }

  // Atomic: expire existing + activate new + record history
  const activated = await prisma.$transaction(async (tx) => {
    await tx.contract.updateMany({
      where: {
        employeeId: id,
        status: "ACTIVE",
        id: { not: contractId },
      },
      data: { status: "EXPIRED" },
    })

    const result = await tx.contract.update({
      where: { id: contractId },
      data: { status: "ACTIVE" },
    })

    await tx.employeeChangeHistory.create({
      data: {
        employeeId: id,
        changedBy: session.user.id,
        fieldName: "contract",
        oldValue: null,
        newValue: `${contract.type} — ${contract.contractNo || contract.probationNo || "N/A"} kích hoạt`,
        reason: "Hợp đồng kích hoạt",
      },
    })

    return result
  })

  return NextResponse.json(activated)
}
