import { db } from '@/lib/db'

export async function getCompensationBudgets(tenantId: string, cycleId: string) {
  return db.compensationBudget.findMany({
    where: { tenantId, cycleId },
    include: { department: true },
    orderBy: { department: { name: 'asc' } },
  })
}

export async function createOrUpdateBudget(tenantId: string, data: {
  cycleId: string; departmentId?: string; totalBudget: number;
  headcount?: number; notes?: string;
}) {
  const existing = await db.compensationBudget.findFirst({
    where: { cycleId: data.cycleId, departmentId: data.departmentId || null },
  })
  if (existing) {
    return db.compensationBudget.update({
      where: { id: existing.id },
      data: { totalBudget: data.totalBudget, headcount: data.headcount, notes: data.notes },
    })
  }
  return db.compensationBudget.create({ data: { ...data, tenantId } })
}

export async function updateBudgetSpent(id: string, spentAmount: number) {
  return db.compensationBudget.update({
    where: { id },
    data: { spentAmount, allocatedAmount: spentAmount },
  })
}
