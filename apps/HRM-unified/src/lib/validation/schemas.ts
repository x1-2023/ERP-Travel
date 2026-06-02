// lib/validation/schemas.ts

/**
 * LAC VIET HR - Input Validation Schemas
 * Zod schemas for all API inputs with Vietnamese messages
 */

import { z } from 'zod';

// ════════════════════════════════════════════════════════════════════════════════
// COMMON VALIDATORS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Email validator with normalization
 */
export const emailSchema = z.string()
  .min(1, 'Email không được để trống')
  .email('Email không hợp lệ')
  .max(255, 'Email quá dài (tối đa 255 ký tự)')
  .transform(val => val.toLowerCase().trim());

/**
 * Vietnamese phone number validator
 * Supports: 0xxxxxxxxx or +84xxxxxxxxx
 */
export const phoneSchema = z.string()
  .regex(
    /^(?:0|\+84)(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
    'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)'
  )
  .transform(val => val.replace(/\s|-/g, ''));

/**
 * Vietnamese name validator
 * Supports Vietnamese characters
 */
export const vietnameseNameSchema = z.string()
  .min(1, 'Tên không được để trống')
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(100, 'Tên quá dài (tối đa 100 ký tự)')
  .regex(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,
    'Tên chỉ được chứa chữ cái và khoảng trắng'
  )
  .transform(val => val.trim());

/**
 * UUID validator
 */
export const uuidSchema = z.string()
  .uuid('ID không hợp lệ');

/**
 * Date validator (YYYY-MM-DD format)
 */
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không đúng định dạng YYYY-MM-DD')
  .refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Ngày không hợp lệ');

/**
 * DateTime validator (ISO 8601 format)
 */
export const dateTimeSchema = z.string()
  .datetime({ message: 'Thời gian không đúng định dạng ISO 8601' });

/**
 * Pagination page number
 */
export const pageSchema = z.coerce.number()
  .int()
  .min(1, 'Trang phải >= 1')
  .default(1);

/**
 * Pagination limit
 */
export const limitSchema = z.coerce.number()
  .int()
  .min(1, 'Số lượng phải >= 1')
  .max(100, 'Số lượng tối đa 100')
  .default(20);

/**
 * Sort order
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Search query (sanitized)
 */
export const searchSchema = z.string()
  .max(200, 'Từ khóa tìm kiếm quá dài')
  .transform(val => sanitizeSearchQuery(val))
  .optional();

/**
 * Vietnamese National ID (CCCD/CMND)
 */
export const nationalIdSchema = z.string()
  .regex(
    /^[0-9]{9}$|^[0-9]{12}$/,
    'CCCD/CMND phải có 9 hoặc 12 chữ số'
  );

/**
 * Tax ID (Mã số thuế)
 */
export const taxIdSchema = z.string()
  .regex(
    /^[0-9]{10}$|^[0-9]{13}$/,
    'Mã số thuế phải có 10 hoặc 13 chữ số'
  );

/**
 * Bank account number
 */
export const bankAccountSchema = z.string()
  .regex(
    /^[0-9]{6,20}$/,
    'Số tài khoản ngân hàng không hợp lệ'
  );

/**
 * Money amount (VND)
 */
export const moneySchema = z.number()
  .min(0, 'Số tiền không được âm')
  .max(999999999999, 'Số tiền quá lớn')
  .multipleOf(1000, 'Số tiền phải là bội số của 1000 VND');

// ════════════════════════════════════════════════════════════════════════════════
// EMPLOYEE SCHEMAS
// ════════════════════════════════════════════════════════════════════════════════

export const employeeStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'PROBATION',
  'TERMINATED',
  'ON_LEAVE'
]);

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const employeeCreateSchema = z.object({
  employeeCode: z.string()
    .min(3, 'Mã nhân viên phải có ít nhất 3 ký tự')
    .max(20, 'Mã nhân viên tối đa 20 ký tự')
    .regex(/^[A-Z0-9-]+$/, 'Mã chỉ chứa chữ in hoa, số và dấu gạch ngang')
    .optional(),
  firstName: vietnameseNameSchema,
  lastName: vietnameseNameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  gender: genderSchema.optional(),
  nationalId: nationalIdSchema.optional(),
  taxId: taxIdSchema.optional(),
  address: z.string().max(500, 'Địa chỉ tối đa 500 ký tự').optional(),
  departmentId: uuidSchema.optional(),
  positionId: uuidSchema.optional(),
  managerId: uuidSchema.optional(),
  hireDate: dateSchema,
  salary: moneySchema.optional(),
  bankAccount: bankAccountSchema.optional(),
  bankName: z.string().max(100).optional(),
  status: employeeStatusSchema.default('ACTIVE'),
}).refine(
  data => {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 18 && age <= 100;
    }
    return true;
  },
  { message: 'Nhân viên phải từ 18 tuổi trở lên', path: ['dateOfBirth'] }
);

export const employeeUpdateSchema = z.object({
  firstName: vietnameseNameSchema.optional(),
  lastName: vietnameseNameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.nullable().optional(),
  dateOfBirth: dateSchema.nullable().optional(),
  gender: genderSchema.nullable().optional(),
  nationalId: nationalIdSchema.nullable().optional(),
  taxId: taxIdSchema.nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  departmentId: uuidSchema.nullable().optional(),
  positionId: uuidSchema.nullable().optional(),
  managerId: uuidSchema.nullable().optional(),
  salary: moneySchema.nullable().optional(),
  bankAccount: bankAccountSchema.nullable().optional(),
  bankName: z.string().max(100).nullable().optional(),
  status: employeeStatusSchema.optional(),
});

export const employeeListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: searchSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROBATION', 'TERMINATED', 'ON_LEAVE', 'ALL']).optional(),
  departmentId: uuidSchema.optional(),
  positionId: uuidSchema.optional(),
  sortBy: z.enum(['name', 'employeeCode', 'hireDate', 'createdAt', 'department']).optional(),
  sortOrder: sortOrderSchema,
});

// ════════════════════════════════════════════════════════════════════════════════
// LEAVE SCHEMAS
// ════════════════════════════════════════════════════════════════════════════════

export const leaveTypeSchema = z.enum([
  'ANNUAL',
  'SICK',
  'UNPAID',
  'MATERNITY',
  'PATERNITY',
  'WEDDING',
  'BEREAVEMENT',
  'SPECIAL',
]);

export const leaveStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

export const leaveCreateSchema = z.object({
  leaveType: leaveTypeSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  reason: z.string()
    .min(10, 'Lý do phải có ít nhất 10 ký tự')
    .max(500, 'Lý do tối đa 500 ký tự'),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.enum(['MORNING', 'AFTERNOON']).optional(),
  attachmentIds: z.array(uuidSchema).max(5, 'Tối đa 5 file đính kèm').optional(),
}).refine(
  data => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', path: ['endDate'] }
).refine(
  data => !data.isHalfDay || data.halfDayPeriod !== undefined,
  { message: 'Phải chọn buổi sáng hoặc chiều khi nghỉ nửa ngày', path: ['halfDayPeriod'] }
).refine(
  data => !data.isHalfDay || data.startDate === data.endDate,
  { message: 'Nghỉ nửa ngày chỉ áp dụng cho cùng một ngày', path: ['endDate'] }
);

export const leaveApproveSchema = z.object({
  comment: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

export const leaveRejectSchema = z.object({
  reason: z.string()
    .min(10, 'Lý do từ chối phải có ít nhất 10 ký tự')
    .max(500, 'Lý do tối đa 500 ký tự'),
});

export const leaveListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  employeeId: uuidSchema.optional(),
  leaveType: leaveTypeSchema.optional(),
  status: leaveStatusSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'status']).optional(),
  sortOrder: sortOrderSchema,
});

// ════════════════════════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ════════════════════════════════════════════════════════════════════════════════

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional().default(false),
  mfaCode: z.string()
    .length(6, 'Mã xác thực phải có 6 chữ số')
    .regex(/^[0-9]+$/, 'Mã xác thực chỉ chứa số')
    .optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(12, 'Mật khẩu phải có ít nhất 12 ký tự')
    .max(128, 'Mật khẩu tối đa 128 ký tự'),
  confirmPassword: z.string(),
  firstName: vietnameseNameSchema,
  lastName: vietnameseNameSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Bạn phải đồng ý với điều khoản sử dụng'
  }),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Mật khẩu xác nhận không khớp', path: ['confirmPassword'] }
);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(12, 'Mật khẩu mới phải có ít nhất 12 ký tự')
    .max(128, 'Mật khẩu tối đa 128 ký tự'),
  confirmNewPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmNewPassword,
  { message: 'Mật khẩu xác nhận không khớp', path: ['confirmNewPassword'] }
).refine(
  data => data.currentPassword !== data.newPassword,
  { message: 'Mật khẩu mới phải khác mật khẩu hiện tại', path: ['newPassword'] }
);

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Token không hợp lệ'),
  password: z.string()
    .min(12, 'Mật khẩu phải có ít nhất 12 ký tự')
    .max(128, 'Mật khẩu tối đa 128 ký tự'),
  confirmPassword: z.string(),
}).refine(
  data => data.password === data.confirmPassword,
  { message: 'Mật khẩu xác nhận không khớp', path: ['confirmPassword'] }
);

export const verifyMfaSchema = z.object({
  code: z.string()
    .length(6, 'Mã xác thực phải có 6 chữ số')
    .regex(/^[0-9]+$/, 'Mã xác thực chỉ chứa số'),
  type: z.enum(['totp', 'backup']).default('totp'),
});

// ════════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD SCHEMAS
// ════════════════════════════════════════════════════════════════════════════════

export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  all: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  default: 10 * 1024 * 1024,   // 10MB
};

export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Tên file không được để trống')
    .max(255, 'Tên file quá dài')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Tên file chứa ký tự không hợp lệ'),
  mimeType: z.string(),
  size: z.number().positive(),
  category: z.enum(['avatar', 'document', 'attachment']).default('attachment'),
});

// ════════════════════════════════════════════════════════════════════════════════
// SANITIZATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>'"`;(){}[\]\\]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' ')               // Normalize whitespace
    .trim()
    .substring(0, 200);                 // Limit length
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// ════════════════════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ════════════════════════════════════════════════════════════════════════════════

export type ValidationError = {
  field: string;
  message: string;
  code: string;
};

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: formatZodErrors(result.error) };
}
