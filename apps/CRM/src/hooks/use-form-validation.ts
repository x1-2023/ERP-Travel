'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'

type FieldErrors = Record<string, string>

interface UseFormValidationReturn {
  /** Field-level error messages: { fieldName: "Error message" } */
  errors: FieldErrors
  /** Validate the entire form data. Returns validated data on success, null on failure. */
  validate: <T>(data: unknown) => T | null
  /** Validate a single field value. Returns true if valid. */
  validateField: (field: string, value: unknown) => boolean
  /** Clear error for a specific field (call on field change). */
  clearFieldError: (field: string) => void
  /** Clear all errors. */
  clearErrors: () => void
  /** Check if a specific field has an error. */
  hasError: (field: string) => boolean
}

/**
 * Client-side Zod validation hook for forms.
 *
 * Usage:
 * ```tsx
 * const { errors, validate, clearFieldError, hasError } = useFormValidation(createContactSchema)
 *
 * function handleSubmit(e) {
 *   e.preventDefault()
 *   const validated = validate<CreateContactInput>(formData)
 *   if (!validated) return // errors are set
 *   onSubmit(validated)
 * }
 *
 * <Input
 *   onChange={(e) => { updateField('email', e.target.value); clearFieldError('email') }}
 *   className={hasError('email') ? 'border-red-500' : ''}
 * />
 * {errors.email && <FieldError message={errors.email} />}
 * ```
 */
export function useFormValidation(schema: z.ZodSchema): UseFormValidationReturn {
  const [errors, setErrors] = useState<FieldErrors>({})

  const validate = useCallback(
    <T,>(data: unknown): T | null => {
      const result = schema.safeParse(data)
      if (result.success) {
        setErrors({})
        return result.data as T
      }

      const fieldErrors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      return null
    },
    [schema]
  )

  const validateField = useCallback(
    (field: string, value: unknown): boolean => {
      // Create a partial object with just this field and validate
      const result = schema.safeParse({ [field]: value })
      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
        return true
      }

      // Find the error for this specific field
      const fieldError = result.error.issues.find(
        (issue) => issue.path[0] === field
      )
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [field]: fieldError.message }))
        return false
      }

      // Field not in error (other fields caused failure)
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
      return true
    },
    [schema]
  )

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasError = useCallback(
    (field: string) => !!errors[field],
    [errors]
  )

  return { errors, validate, validateField, clearFieldError, clearErrors, hasError }
}
