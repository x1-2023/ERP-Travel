import { z } from 'zod'

const allowanceSchema = z.object({
  name: z.string().min(1, 'Tên phụ cấp là bắt buộc'),
  amount: z.coerce.number().min(0, 'Số tiền phải >= 0'),
  taxable: z.boolean().default(true),
})

export const contractSchema = z.object({
  employeeId: z.string().min(1, 'Nhân viên là bắt buộc'),
  contractNumber: z.string().min(1, 'Số hợp đồng là bắt buộc').max(50),
  contractType: z.enum(['PROBATION', 'DEFINITE_TERM', 'INDEFINITE_TERM', 'SEASONAL', 'PART_TIME'], {
    message: 'Loại hợp đồng là bắt buộc',
  }),
  signedDate: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date({ message: 'Ngày bắt đầu là bắt buộc' }),
  endDate: z.coerce.date().optional().nullable(),
  baseSalary: z.coerce.number().min(0, 'Lương cơ bản phải >= 0'),
  salaryType: z.enum(['GROSS', 'NET']).default('GROSS'),
  insuranceSalary: z.coerce.number().min(0).optional().nullable(),
  allowances: z.array(allowanceSchema).optional().default([]),
  workSchedule: z.string().max(200).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('DRAFT'),
  terminationDate: z.coerce.date().optional().nullable(),
  terminationReason: z.string().max(500).optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const createContractSchema = contractSchema

export const updateContractSchema = contractSchema.partial().extend({
  id: z.string(),
})

export type ContractFormData = z.infer<typeof contractSchema>
export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
export type Allowance = z.infer<typeof allowanceSchema>
