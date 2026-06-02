import { db } from '@/lib/db'

export async function getAllowanceTypes(tenantId: string) {
  return db.allowanceType.findMany({
    where: { tenantId, isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function createAllowanceType(tenantId: string, data: {
  name: string; code: string; description?: string;
  defaultAmount?: number; frequency?: string;
  isTaxable?: boolean; isInsurable?: boolean;
}) {
  return db.allowanceType.create({
    data: { ...data, tenantId, frequency: (data.frequency || 'MONTHLY') as any },
  })
}

export async function updateAllowanceType(id: string, tenantId: string, data: {
  name?: string; description?: string; defaultAmount?: number;
  isTaxable?: boolean; isInsurable?: boolean; isActive?: boolean;
}) {
  return db.allowanceType.update({ where: { id }, data })
}

export async function getEmployeeAllowances(tenantId: string, employeeId: string) {
  return db.employeeAllowance.findMany({
    where: { tenantId, employeeId, isActive: true },
    include: { allowanceType: true },
    orderBy: { effectiveFrom: 'desc' },
  })
}

export async function assignAllowance(tenantId: string, data: {
  employeeId: string; allowanceTypeId: string; amount: number;
  frequency?: string; effectiveFrom: Date; effectiveTo?: Date; notes?: string;
}) {
  return db.employeeAllowance.create({
    data: { ...data, tenantId, frequency: (data.frequency || 'MONTHLY') as any },
  })
}

export async function updateEmployeeAllowance(id: string, data: {
  amount?: number; effectiveTo?: Date; isActive?: boolean; notes?: string;
}) {
  return db.employeeAllowance.update({ where: { id }, data })
}

export async function removeAllowance(id: string) {
  return db.employeeAllowance.update({
    where: { id },
    data: { isActive: false, effectiveTo: new Date() },
  })
}
