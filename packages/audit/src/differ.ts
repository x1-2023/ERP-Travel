/**
 * Deep Diff Utility
 * Compares two objects and returns detailed change information
 */

import { Change } from "./types";

/**
 * Fields to ignore during diff
 */
const IGNORED_FIELDS = new Set(["updatedAt", "version", "_count", "createdAt"]);

/**
 * Sensitive fields to mask in diffs
 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "secret",
  "apiKey",
  "refreshToken",
  "accessToken",
  "privateKey",
  "sessionToken",
]);

/**
 * Mask sensitive field values
 */
function maskSensitiveValue(
  value: unknown,
  isSensitive: boolean
): unknown {
  if (!isSensitive) return value;
  if (value === null || value === undefined) return value;
  if (typeof value === "string" && value.length > 0) return "***";
  return value;
}

/**
 * Check if a field is sensitive
 */
function isSensitiveField(field: string): boolean {
  return SENSITIVE_FIELDS.has(field);
}

/**
 * Deep comparison of two values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (a === undefined || b === undefined) return a === b;

  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) return false;

  if (aType === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => deepEqual(item, b[index]));
    }

    if (Array.isArray(a) || Array.isArray(b)) return false;

    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every((key) =>
      deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}

/**
 * Deep diff of two objects
 * Returns array of changes (field, oldValue, newValue)
 */
export function computeDiff(
  oldValue: unknown,
  newValue: unknown
): Change[] {
  const changes: Change[] = [];

  // Handle null/undefined cases
  if (oldValue === null || oldValue === undefined) {
    if (newValue !== null && newValue !== undefined) {
      return [
        {
          field: "*",
          oldValue: oldValue,
          newValue: newValue,
        },
      ];
    }
    return changes;
  }

  if (newValue === null || newValue === undefined) {
    return [
      {
        field: "*",
        oldValue: oldValue,
        newValue: newValue,
      },
    ];
  }

  // Both are objects
  if (
    typeof oldValue === "object" &&
    typeof newValue === "object" &&
    !Array.isArray(oldValue) &&
    !Array.isArray(newValue)
  ) {
    const oldObj = oldValue as Record<string, unknown>;
    const newObj = newValue as Record<string, unknown>;
    const allKeys = new Set([
      ...Object.keys(oldObj),
      ...Object.keys(newObj),
    ]);

    for (const field of allKeys) {
      if (IGNORED_FIELDS.has(field)) continue;

      const oldFieldValue = oldObj[field];
      const newFieldValue = newObj[field];
      const isSensitive = isSensitiveField(field);

      if (!deepEqual(oldFieldValue, newFieldValue)) {
        changes.push({
          field,
          oldValue: maskSensitiveValue(oldFieldValue, isSensitive),
          newValue: maskSensitiveValue(newFieldValue, isSensitive),
        });
      }
    }

    return changes;
  }

  // Arrays or primitive types changed
  if (!deepEqual(oldValue, newValue)) {
    return [
      {
        field: "*",
        oldValue: oldValue,
        newValue: newValue,
      },
    ];
  }

  return changes;
}

/**
 * Recursively mask all sensitive fields in an object
 */
export function maskSensitiveData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveField(key)) {
      masked[key] = maskSensitiveValue(value, true);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      masked[key] = maskSensitiveData(
        value as Record<string, unknown>
      );
    } else if (Array.isArray(value)) {
      masked[key] = value.map((item) =>
        typeof item === "object" && item !== null && !Array.isArray(item)
          ? maskSensitiveData(item as Record<string, unknown>)
          : item
      );
    } else {
      masked[key] = value;
    }
  }

  return masked;
}
