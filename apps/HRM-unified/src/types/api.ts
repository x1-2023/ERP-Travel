export interface ApiKeyInfo {
  id: string
  name: string
  description?: string | null
  keyPrefix: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date | null
  expiresAt?: Date | null
  createdAt: Date
}

export interface ApiKeyCreate {
  name: string
  description?: string
  permissions: string[]
  expiresAt?: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export const API_PERMISSIONS = [
  'read:employees',
  'write:employees',
  'read:attendance',
  'write:attendance',
  'read:leave',
  'read:payroll',
  'webhooks:manage',
] as const
