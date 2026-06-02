import { z } from 'zod'
import { BadRequest } from '@/lib/api/errors'

// ── Vietnamese error map ────────────────────────────────────────────

export const vietnameseErrorMap: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case 'invalid_type':
      return { message: 'Không được để trống' }

    case 'too_small':
      if ((issue as any).origin === 'string') {
        if ((issue as any).minimum === 1) return { message: 'Không được để trống' }
        return { message: `Tối thiểu ${(issue as any).minimum} ký tự` }
      }
      if ((issue as any).origin === 'number') {
        return { message: `Giá trị phải >= ${(issue as any).minimum}` }
      }
      if ((issue as any).origin === 'array') {
        return { message: `Cần ít nhất ${(issue as any).minimum} mục` }
      }
      return { message: 'Giá trị quá nhỏ' }

    case 'too_big':
      if ((issue as any).origin === 'string') {
        return { message: `Tối đa ${(issue as any).maximum} ký tự` }
      }
      if ((issue as any).origin === 'number') {
        return { message: `Giá trị phải <= ${(issue as any).maximum}` }
      }
      return { message: 'Giá trị quá lớn' }

    case 'invalid_format':
      if ((issue as any).format === 'email') return { message: 'Email không hợp lệ' }
      if ((issue as any).format === 'url') return { message: 'URL không hợp lệ' }
      if ((issue as any).format === 'cuid') return { message: 'ID không hợp lệ' }
      return { message: 'Định dạng không hợp lệ' }

    case 'invalid_value':
      return { message: 'Giá trị không hợp lệ' }

    default:
      return { message: 'Giá trị không hợp lệ' }
  }
}

// Set global error map
z.setErrorMap(vietnameseErrorMap)

// ── Format Zod errors to field map ──────────────────────────────────

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message
    }
  }
  return fieldErrors
}

// ── Server-side validation ──────────────────────────────────────────

/**
 * Validate request data against a Zod schema.
 * On success: returns parsed + typed data.
 * On failure: throws ApiError (BadRequest) with field errors.
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }
  const details = formatZodErrors(result.error)
  throw BadRequest('Dữ liệu không hợp lệ', details)
}
