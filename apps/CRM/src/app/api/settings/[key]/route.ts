import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { getSettingOrDefault, setSetting, type SettingsKey } from '@/lib/settings'
import { settingsSchemaMap, validateRequest } from '@/lib/validations'
import { handleApiError, BadRequest } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

const VALID_KEYS = ['company', 'pipeline', 'notifications', 'email', 'order']

// GET /api/settings/[key] — Get single setting merged with defaults
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    await getCurrentUser()
    const { key } = params

    if (!VALID_KEYS.includes(key)) {
      throw BadRequest(`Khóa cài đặt không hợp lệ: ${key}`)
    }

    const value = await getSettingOrDefault(key as SettingsKey)
    return NextResponse.json({ key, value })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, `/api/settings/${params.key}`)
  }
}

// PUT /api/settings/[key] — Update setting (ADMIN only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const user = result
    const { key } = params

    if (!VALID_KEYS.includes(key)) {
      throw BadRequest(`Khóa cài đặt không hợp lệ: ${key}`)
    }

    const body = await req.json()
    const { value } = body

    if (value === undefined) {
      throw BadRequest('Thiếu trường value')
    }

    // Validate value against the key's schema
    const schema = settingsSchemaMap[key]
    if (schema) {
      validateRequest(schema, value)
    }

    await setSetting(key as SettingsKey, value, user.id)

    logger.audit('settings.update', user.id, { key })

    const updated = await getSettingOrDefault(key as SettingsKey)
    return NextResponse.json({ key, value: updated })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, `/api/settings/${params.key}`)
  }
}
