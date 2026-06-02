import { db } from '@/lib/db';

export async function getTrainingBudgets(tenantId: string, year?: number) {
  const where: any = { tenantId };
  if (year) where.year = year;

  return db.trainingBudget.findMany({
    where,
    include: { department: { select: { id: true, name: true } } },
    orderBy: [{ year: 'desc' }, { department: { name: 'asc' } }],
  });
}

export async function createOrUpdateBudget(tenantId: string, data: {
  year: number;
  departmentId?: string;
  totalBudget: number;
  notes?: string;
}) {
  return db.trainingBudget.upsert({
    where: { tenantId_year_departmentId: { tenantId, year: data.year, departmentId: data.departmentId || '' } },
    create: { tenantId, year: data.year, departmentId: data.departmentId, totalBudget: data.totalBudget, notes: data.notes },
    update: { totalBudget: data.totalBudget, notes: data.notes },
  });
}

export async function updateBudgetSpending(tenantId: string, year: number, departmentId: string | null, amount: number) {
  const budget = await db.trainingBudget.findFirst({
    where: { tenantId, year, departmentId: departmentId || undefined },
  });
  if (!budget) return null;

  return db.trainingBudget.update({
    where: { id: budget.id },
    data: { spentAmount: { increment: amount } },
  });
}
