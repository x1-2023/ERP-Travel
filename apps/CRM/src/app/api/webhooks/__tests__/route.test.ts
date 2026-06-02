import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockWebhook, mockRequireRole } = vi.hoisted(() => ({
  mockWebhook: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
  mockRequireRole: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: { webhook: mockWebhook } }))

vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: vi.fn(),
  AuthError: class AuthError extends Error {
    status: number
    constructor(msg: string, status = 401) { super(msg); this.status = status; this.name = 'AuthError' }
  },
}))

vi.mock('@/lib/auth/rbac', async () => {
  const actual = await vi.importActual('@/lib/auth/rbac') as any
  return { ...actual, requireRole: (...args: any[]) => mockRequireRole(...args) }
})

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

import { GET, POST } from '../route'

describe('GET /api/webhooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ADMIN sees all webhooks', async () => {
    mockRequireRole.mockResolvedValue(mockCurrentUser({ role: 'ADMIN' }))
    mockWebhook.findMany.mockResolvedValue([{
      id: 'wh-1', name: 'Test', url: 'https://example.com/hook',
      events: ['contact.created'], active: true, createdAt: new Date(),
      _count: { logs: 5 }, logs: [{ success: true, createdAt: new Date() }],
    }])
    const res = await GET()
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.length).toBe(1)
    expect(body[0].successRate).toBe(100)
  })

  it('non-ADMIN gets 403', async () => {
    const { NextResponse } = await import('next/server')
    mockRequireRole.mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    const res = await GET()
    expect(res.status).toBe(403)
  })
})

describe('POST /api/webhooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates webhook with auto-generated secret', async () => {
    mockRequireRole.mockResolvedValue(mockCurrentUser({ role: 'ADMIN' }))
    mockWebhook.create.mockResolvedValue({
      id: 'wh-new', name: 'New Hook', url: 'https://example.com/hook',
      events: ['contact.created'], active: true, secret: 'whsec_abc', createdAt: new Date(),
    })
    const req = mockRequest({ method: 'POST', body: { name: 'New Hook', url: 'https://example.com/hook', events: ['contact.created'] } })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockWebhook.create).toHaveBeenCalled()
  })

  it('rejects invalid URL', async () => {
    mockRequireRole.mockResolvedValue(mockCurrentUser({ role: 'ADMIN' }))
    const req = mockRequest({ method: 'POST', body: { name: 'Bad', url: 'not-a-url', events: ['contact.created'] } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects empty events array', async () => {
    mockRequireRole.mockResolvedValue(mockCurrentUser({ role: 'ADMIN' }))
    const req = mockRequest({ method: 'POST', body: { name: 'Empty', url: 'https://example.com', events: [] } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('non-ADMIN gets 403', async () => {
    const { NextResponse } = await import('next/server')
    mockRequireRole.mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    const req = mockRequest({ method: 'POST', body: { name: 'X', url: 'https://x.com', events: ['a'] } })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })
})
