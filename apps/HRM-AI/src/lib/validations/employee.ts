import { z } from 'zod'

// Form schema uses string/Date union for form compatibility
export const employeeFormSchema = z.object({
  employeeCode: z.string().min(1, 'Mã nhân viên là bắt buộc').max(20),
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  dateOfBirth: z.union([z.string(), z.date()]).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  idNumber: z.string().max(20).optional().nullable(),
  idIssueDate: z.union([z.string(), z.date()]).optional().nullable(),
  idIssuePlace: z.string().max(200).optional().nullable(),
  taxCode: z.string().max(20).optional().nullable(),
  socialInsuranceNumber: z.string().max(20).optional().nullable(),
  socialInsuranceDate: z.union([z.string(), z.date()]).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  personalEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  workEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  permanentAddress: z.string().max(500).optional().nullable(),
  currentAddress: z.string().max(500).optional().nullable(),
  bankAccount: z.string().max(50).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankBranch: z.string().max(100).optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  directManagerId: z.string().optional().nullable(),
  hireDate: z.union([z.string(), z.date()]),
  probationEndDate: z.union([z.string(), z.date()]).optional().nullable(),
  status: z.enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']),
  resignationDate: z.union([z.string(), z.date()]).optional().nullable(),
  resignationReason: z.string().max(500).optional().nullable(),
  avatar: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// API schema uses Date types
export const employeeSchema = z.object({
  employeeCode: z.string().min(1, 'Mã nhân viên là bắt buộc').max(20),
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  idNumber: z.string().max(20).optional().nullable(),
  idIssueDate: z.coerce.date().optional().nullable(),
  idIssuePlace: z.string().max(200).optional().nullable(),
  taxCode: z.string().max(20).optional().nullable(),
  socialInsuranceNumber: z.string().max(20).optional().nullable(),
  socialInsuranceDate: z.coerce.date().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  personalEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  workEmail: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  permanentAddress: z.string().max(500).optional().nullable(),
  currentAddress: z.string().max(500).optional().nullable(),
  bankAccount: z.string().max(50).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankBranch: z.string().max(100).optional().nullable(),
  departmentId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  directManagerId: z.string().optional().nullable(),
  hireDate: z.coerce.date({ message: 'Ngày vào làm là bắt buộc' }),
  probationEndDate: z.coerce.date().optional().nullable(),
  status: z.enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED']).default('ACTIVE'),
  resignationDate: z.coerce.date().optional().nullable(),
  resignationReason: z.string().max(500).optional().nullable(),
  avatar: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const createEmployeeSchema = employeeSchema

export const updateEmployeeSchema = employeeSchema.partial().extend({
  id: z.string(),
})

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>
export type EmployeeFormData = z.infer<typeof employeeSchema>
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
