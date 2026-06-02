import { NextResponse } from 'next/server'

/**
 * Wrap a successful API response.
 *
 * Usage pattern for new/refactored routes:
 *   return apiSuccess(data)
 *   return apiCreated(newRecord)
 *   return apiNoContent()
 */

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function apiCreated<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
