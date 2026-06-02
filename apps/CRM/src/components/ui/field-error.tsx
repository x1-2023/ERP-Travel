/**
 * Inline field error message for form validation.
 * Shows a small red error text below the input.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-red-400 mt-1">{message}</p>
  )
}
