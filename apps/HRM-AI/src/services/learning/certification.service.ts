import { db } from '@/lib/db';
import { CERTIFICATION_EXPIRY_WARNING_DAYS } from '@/lib/learning/constants';

export async function getCertificationTypes(tenantId: string) {
  return db.certificationType.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function createCertificationType(
  tenantId: string,
  data: { name: string; description?: string; provider?: string; validityMonths?: number; isExternal?: boolean }
) {
  return db.certificationType.create({ data: { tenantId, ...data } });
}

export async function addEmployeeCertification(
  tenantId: string,
  employeeId: string,
  data: {
    certificationTypeId: string;
    certificateNumber?: string;
    issuedDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
    cost?: number;
    paidByCompany?: boolean;
    notes?: string;
  }
) {
  let status: any = 'ACTIVE';
  if (data.expiryDate) {
    const today = new Date();
    const expiryDate = new Date(data.expiryDate);
    const warningDate = new Date(expiryDate);
    warningDate.setDate(warningDate.getDate() - CERTIFICATION_EXPIRY_WARNING_DAYS);
    if (expiryDate < today) {
      status = 'EXPIRED';
    } else if (warningDate < today) {
      status = 'EXPIRING_SOON';
    }
  }

  return db.employeeCertification.create({
    data: {
      tenantId,
      employeeId,
      certificationTypeId: data.certificationTypeId,
      certificateNumber: data.certificateNumber,
      issuedDate: data.issuedDate,
      expiryDate: data.expiryDate,
      status,
      documentUrl: data.documentUrl,
      cost: data.cost,
      paidByCompany: data.paidByCompany ?? true,
      notes: data.notes,
    },
    include: { certificationType: true },
  });
}

export async function getEmployeeCertifications(
  tenantId: string,
  employeeId: string,
  filters?: { status?: string }
) {
  const where: any = { tenantId, employeeId };
  if (filters?.status) where.status = filters.status;

  return db.employeeCertification.findMany({
    where,
    include: {
      certificationType: true,
      verifiedBy: { select: { id: true, name: true } },
    },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function getExpiringCertifications(tenantId: string, daysAhead = CERTIFICATION_EXPIRY_WARNING_DAYS) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return db.employeeCertification.findMany({
    where: {
      tenantId,
      status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
      expiryDate: { lte: futureDate, gte: new Date() },
    },
    include: {
      employee: { select: { id: true, fullName: true } },
      certificationType: true,
    },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function updateCertificationStatuses(tenantId: string) {
  const today = new Date();
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + CERTIFICATION_EXPIRY_WARNING_DAYS);

  await db.employeeCertification.updateMany({
    where: { tenantId, status: { in: ['ACTIVE', 'EXPIRING_SOON'] }, expiryDate: { lt: today } },
    data: { status: 'EXPIRED' },
  });

  await db.employeeCertification.updateMany({
    where: { tenantId, status: 'ACTIVE', expiryDate: { lte: warningDate, gte: today } },
    data: { status: 'EXPIRING_SOON' },
  });
}

export async function verifyCertification(id: string, tenantId: string, verifiedById: string) {
  return db.employeeCertification.update({
    where: { id },
    data: { verifiedById, verifiedAt: new Date() },
  });
}
