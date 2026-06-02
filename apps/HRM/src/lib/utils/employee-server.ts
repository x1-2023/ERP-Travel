import { prisma } from "@/lib/prisma"

/**
 * Auto-generate employee code: RTR-{YEAR}-{3-digit-sequence}
 * Queries DB for max sequence of current year
 * SERVER-ONLY — uses Prisma
 */
export async function generateEmployeeCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RTR-${year}-`

  const lastEmployee = await prisma.employee.findFirst({
    where: {
      employeeCode: { startsWith: prefix },
    },
    orderBy: { employeeCode: "desc" },
    select: { employeeCode: true },
  })

  let sequence = 1
  if (lastEmployee) {
    const lastSeq = parseInt(lastEmployee.employeeCode.split("-")[2], 10)
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1
    }
  }

  return `${prefix}${sequence.toString().padStart(3, "0")}`
}
