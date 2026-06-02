import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockContactModel, mockGetCurrentUser, mockRequireRole } = vi.hoisted(() => ({
  mockContactModel: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({}),
  },
  mockGetCurrentUser: vi.fn(),
  mockRequireRole: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: { contact: mockContactModel } }))

vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
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

describe('GET /api/contacts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns paginated contacts list', async () => {
    const user = mockCurrentUser({ role: 'MANAGER' })
    mockGetCurrentUser.mockResolvedValue(user)
    const contacts = [{ id: 'c-1', firstName: 'Alice' }]
    mockContactModel.findMany.mockResolvedValue(contacts)
    mockContactModel.count.mockResolvedValue(1)

    const req = mockRequest({ searchParams: { page: '1', limit: '20' } })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toEqual(contacts)
    expect(body.total).toBe(1)
  })

  it('MEMBER role filters by ownerId', async () => {
    const user = mockCurrentUser({ role: 'MEMBER' })
    mockGetCurrentUser.mockResolvedValue(user)
    mockContactModel.findMany.mockResolvedValue([])
    mockContactModel.count.mockResolvedValue(0)
    await GET(mockRequest({}))
    const whereArg = mockContactModel.findMany.mock.calls[0][0].where
    expect(whereArg.ownerId).toBe('user-1')
  })

  it('MANAGER role sees all contacts', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockContactModel.findMany.mockResolvedValue([])
    mockContactModel.count.mockResolvedValue(0)
    await GET(mockRequest({}))
    const whereArg = mockContactModel.findMany.mock.calls[0][0].where
    expect(whereArg.ownerId).toBeUndefined()
  })

  it('applies search filter', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockContactModel.findMany.mockResolvedValue([])
    mockContactModel.count.mockResolvedValue(0)
    await GET(mockRequest({ searchParams: { q: 'alice' } }))
    const whereArg = mockContactModel.findMany.mock.calls[0][0].where
    expect(whereArg.OR).toBeDefined()
    expect(whereArg.OR.length).toBeGreaterThan(0)
  })

  it('returns 401 for unauthenticated user', async () => {
    const { AuthError } = await import('@/lib/auth/get-current-user')
    mockGetCurrentUser.mockRejectedValue(new AuthError('Unauthorized'))
    const res = await GET(mockRequest({}))
    expect(res.status).toBe(401)
  })
})

describe('POST /api/contacts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates contact with valid data', async () => {
    const user = mockCurrentUser({ role: 'MANAGER' })
    mockRequireRole.mockResolvedValue(user)
    mockContactModel.create.mockResolvedValue({ id: 'c-new', firstName: 'Test', lastName: 'User' })
    const req = mockRequest({ method: 'POST', body: { firstName: 'Test', lastName: 'User', status: 'LEAD' } })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('VIEWER role gets 403', async () => {
    const { NextResponse } = await import('next/server')
    mockRequireRole.mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    const req = mockRequest({ method: 'POST', body: {} })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })
})
