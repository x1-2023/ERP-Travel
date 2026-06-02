import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdvanceList } from "@/components/advances/advance-list"

export default async function AdvancesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session.user.role)

  // Get baseSalary for non-HR users
  let baseSalary: number | null = null
  if (!isHR) {
    const emp = await prisma.employee.findFirst({
      where: { userId: session.user.id },
      select: {
        contracts: {
          where: { status: "ACTIVE" },
          select: { baseSalary: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
    if (emp?.contracts[0]?.baseSalary) {
      baseSalary = Number(emp.contracts[0].baseSalary)
    }
  }

  return <AdvanceList isHR={isHR} baseSalary={baseSalary} />
}
