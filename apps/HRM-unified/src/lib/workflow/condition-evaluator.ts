// src/lib/workflow/condition-evaluator.ts
// Workflow Condition Evaluator

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in'

export interface Condition {
  field: string
  operator: Operator
  value: unknown
}

// ═══════════════════════════════════════════════════════════════
// Main Evaluator
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate workflow conditions against context data
 * If conditions is an array, ALL conditions must be true (AND logic)
 */
export function evaluateCondition(
  conditions: Condition | Condition[],
  context: Record<string, unknown>
): boolean {
  if (!conditions) return true

  if (Array.isArray(conditions)) {
    // All conditions must be true (AND)
    return conditions.every(c => evaluateSingle(c, context))
  }

  return evaluateSingle(conditions, context)
}

/**
 * Evaluate a single condition
 */
function evaluateSingle(condition: Condition, context: Record<string, unknown>): boolean {
  const { field, operator, value } = condition
  const actual = getNestedValue(context, field)

  switch (operator) {
    case '=':
      return actual === value

    case '!=':
      return actual !== value

    case '>':
      return Number(actual) > Number(value)

    case '<':
      return Number(actual) < Number(value)

    case '>=':
      return Number(actual) >= Number(value)

    case '<=':
      return Number(actual) <= Number(value)

    case 'in':
      if (Array.isArray(value)) {
        return value.includes(actual)
      }
      return false

    case 'not_in':
      if (Array.isArray(value)) {
        return !value.includes(actual)
      }
      return true

    default:
      return true
  }
}

/**
 * Get nested value from object using dot notation
 * e.g., getNestedValue({a: {b: 1}}, 'a.b') => 1
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

// ═══════════════════════════════════════════════════════════════
// Condition Builder Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Create a simple equality condition
 */
export function equals(field: string, value: unknown): Condition {
  return { field, operator: '=', value }
}

/**
 * Create a greater than condition
 */
export function greaterThan(field: string, value: number): Condition {
  return { field, operator: '>', value }
}

/**
 * Create a less than condition
 */
export function lessThan(field: string, value: number): Condition {
  return { field, operator: '<', value }
}

/**
 * Create an "in list" condition
 */
export function inList(field: string, values: unknown[]): Condition {
  return { field, operator: 'in', value: values }
}

/**
 * Validate condition format
 */
export function isValidCondition(condition: unknown): condition is Condition {
  if (!condition || typeof condition !== 'object') return false

  const c = condition as Record<string, unknown>
  return (
    typeof c.field === 'string' &&
    typeof c.operator === 'string' &&
    ['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in'].includes(c.operator as string) &&
    c.value !== undefined
  )
}
