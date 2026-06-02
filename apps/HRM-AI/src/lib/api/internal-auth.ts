// src/lib/api/internal-auth.ts
// Internal API authentication helper for cross-module communication

import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_SOURCES = [
  'prismy-crm',
  'prismy-mrp',
  'prismy-otb',
  'prismy-tpm',
  'prismy-shell',
]

/**
 * Validate that the request comes from an authorized Prismy module.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function validateInternalRequest(req: NextRequest): NextResponse | null {
  const source = req.headers.get('x-prismy-source')
  if (!source || !ALLOWED_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid x-prismy-source' },
      { status: 401 }
    )
  }
  return null
}
