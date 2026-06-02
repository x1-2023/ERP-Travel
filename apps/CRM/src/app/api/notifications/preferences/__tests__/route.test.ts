import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockPref, mockGetCurrentUser } = vi.hoisted(() => ({
  mockPref: { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn() },
  mockGetCurrentUser: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: { notificationPreference: mockPref } }))

vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
  AuthError: class AuthError extends Error {
    status: number
    constructor(msg: string, status = 401) { super(msg); this.status = status; this.name = 'AuthError' }
  },
}))

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

import { GET, PUT } from '../route'

describe('GET /api/notifications/preferences', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns preferences with defaults', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser())
    mockPref.findMany.mockResolvedValue([])
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    expect(body[0].inApp).toBe(true)
    expect(body[0].email).toBe(false)
  })

  it('reflects saved preferences', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser())
    mockPref.findMany.mockResolvedValue([{ eventType: 'quote.accepted', inApp: false, email: true }])
    const res = await GET()
    const body = await res.json()
    const qa = body.find((p: any) => p.eventType === 'quote.accepted')
    expect(qa.inApp).toBe(false)
    expect(qa.email).toBe(true)
  })
})

describe('PUT /api/notifications/preferences', () => {
  beforeEach(() => vi.clearAllMocks())

  it('upserts preferences correctly', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser())
    mockPref.upsert.mockResolvedValue({})
    mockPref.findMany.mockResolvedValue([{ eventType: 'quote.accepted', inApp: true, email: true }])
    const req = mockRequest({ method: 'PUT', body: { preferences: [{ eventType: 'quote.accepted', inApp: true, email: true }] } })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    expect(mockPref.upsert).toHaveBeenCalled()
  })

  it('rejects invalid body (not array)', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser())
    const req = mockRequest({ method: 'PUT', body: { preferences: 'invalid' } })
    const res = await PUT(req)
    expect(res.status).toBe(400)
  })

  it('filters out invalid event types', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser())
    mockPref.upsert.mockResolvedValue({})
    mockPref.findMany.mockResolvedValue([])
    const req = mockRequest({ method: 'PUT', body: { preferences: [{ eventType: 'invalid.event', inApp: true, email: true }, { eventType: 'quote.accepted', inApp: true, email: false }] } })
    const res = await PUT(req)
    expect(res.status).toBe(200)
    expect(mockPref.upsert).toHaveBeenCalledTimes(1)
  })

  it('returns 401 for unauthenticated user', async () => {
    const { AuthError } = await import('@/lib/auth/get-current-user')
    mockGetCurrentUser.mockRejectedValue(new AuthError('Unauthorized'))
    const req = mockRequest({ method: 'PUT', body: { preferences: [] } })
    const res = await PUT(req)
    expect(res.status).toBe(401)
  })
})
