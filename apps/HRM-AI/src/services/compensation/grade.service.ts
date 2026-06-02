import { db } from '@/lib/db'

export async function getSalaryGrades(tenantId: string) {
  return db.salaryGrade.findMany({
    where: { tenantId, isActive: true },
    orderBy: { level: 'asc' },
  })
}

export async function getSalaryGradeById(id: string, tenantId: string) {
  return db.salaryGrade.findFirst({
    where: { id, tenantId },
  })
}

export async function createSalaryGrade(tenantId: string, data: {
  code: string; name: string; level: number;
  minSalary: number; midSalary: number; maxSalary: number;
  currency?: string; description?: string;
}) {
  return db.salaryGrade.create({
    data: { ...data, tenantId },
  })
}

export async function updateSalaryGrade(id: string, tenantId: string, data: {
  name?: string; minSalary?: number; midSalary?: number; maxSalary?: number;
  description?: string; isActive?: boolean;
}) {
  return db.salaryGrade.update({
    where: { id },
    data,
  })
}

export async function deleteSalaryGrade(id: string, tenantId: string) {
  return db.salaryGrade.update({
    where: { id },
    data: { isActive: false },
  })
}
