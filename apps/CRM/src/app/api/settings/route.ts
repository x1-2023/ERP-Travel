import { NextResponse } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { getAllSettings } from '@/lib/settings'
import { handleApiError } from '@/lib/api/errors'

// GET /api/settings — Get all settings merged with defaults
export async function GET() {
  try {
    await getCurrentUser()
    const settings = await getAllSettings()
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/settings')
  }
}
