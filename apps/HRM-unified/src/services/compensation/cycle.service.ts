import { db } from '@/lib/db'

export async function getCompensationCycles(tenantId: string, year?: number) {
  return db.compensationCycle.findMany({
    where: { tenantId, ...(year ? { year } : {}) },
    include: { _count: { select: { reviews: true } } },
    orderBy: { year: 'desc' },
  })
}

export async function getCompensationCycleById(id: string, tenantId: string) {
  return db.compensationCycle.findFirst({
    where: { id, tenantId },
    include: {
      reviews: { include: { employee: { include: { department: true, position: true } } } },
      budgets: { include: { department: true } },
    },
  })
}

export async function createCompensationCycle(tenantId: string, data: {
  name: string; year: number; startDate: Date; endDate: Date;
  budgetPercent?: number; notes?: string;
}) {
  return db.compensationCycle.create({
    data: { ...data, tenantId },
  })
}

export async function updateCompensationCycle(id: string, tenantId: string, data: {
  name?: string; status?: string; startDate?: Date; endDate?: Date;
  budgetPercent?: number; notes?: string;
}) {
  return db.compensationCycle.update({
    where: { id },
    data: data as any,
  })
}

export async function updateCycleStatus(id: string, tenantId: string, status: string) {
  return db.compensationCycle.update({
    where: { id },
    data: { status: status as any },
  })
}
