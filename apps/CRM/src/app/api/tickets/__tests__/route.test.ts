import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockTicket, mockGetCurrentUser } = vi.hoisted(() => ({
  mockTicket: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
    update: vi.fn(),
  },
  mockGetCurrentUser: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: { supportTicket: mockTicket } }))

vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
  AuthError: class AuthError extends Error {
    status: number
    constructor(msg: string, status = 401) { super(msg); this.status = status; this.name = 'AuthError' }
  },
}))

vi.mock('@/lib/auth/rbac', async () => {
  const actual = await vi.importActual('@/lib/auth/rbac') as any
  return { ...actual }
})

vi.mock('@/lib/tickets/sla-engine', () => ({
  calculateSlaStatus: vi.fn().mockResolvedValue({
    firstResponse: { status: 'on_track', target: '', actual: null, remaining: 3600000 },
    resolution: { status: 'on_track', target: '', actual: null, remaining: 7200000 },
  }),
}))

vi.mock('@/lib/events', () => ({
  eventBus: { emit: vi.fn().mockReturnValue({ catch: vi.fn() }) },
  CRM_EVENTS: { TICKET_ASSIGNED: 'ticket.assigned', TICKET_RESOLVED: 'ticket.resolved' },
}))

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

import { GET } from '../route'

describe('GET /api/tickets', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns paginated tickets', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.findMany.mockResolvedValue([])
    mockTicket.count.mockResolvedValue(0)
    const res = await GET(mockRequest({}))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('MEMBER sees only assigned tickets', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MEMBER' }))
    mockTicket.findMany.mockResolvedValue([])
    mockTicket.count.mockResolvedValue(0)
    await GET(mockRequest({}))
    const whereArg = mockTicket.findMany.mock.calls[0][0].where
    expect(whereArg.assigneeId).toBe('user-1')
  })

  it('filters by status', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.findMany.mockResolvedValue([])
    mockTicket.count.mockResolvedValue(0)
    await GET(mockRequest({ searchParams: { status: 'OPEN' } }))
    const whereArg = mockTicket.findMany.mock.calls[0][0].where
    expect(whereArg.status).toBe('OPEN')
  })

  it('filters by priority', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.findMany.mockResolvedValue([])
    mockTicket.count.mockResolvedValue(0)
    await GET(mockRequest({ searchParams: { priority: 'URGENT' } }))
    const whereArg = mockTicket.findMany.mock.calls[0][0].where
    expect(whereArg.priority).toBe('URGENT')
  })
})

describe('PATCH /api/tickets/[id]', () => {
  const existingTicket = {
    id: 'ticket-1', status: 'OPEN', subject: 'Test', priority: 'MEDIUM', assigneeId: null,
    portalUser: { firstName: 'Portal', lastName: 'User' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockTicket.findUnique.mockResolvedValue(existingTicket)
  })

  it('valid status transition succeeds', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.update.mockResolvedValue({ ...existingTicket, status: 'IN_PROGRESS', portalUser: existingTicket.portalUser })
    const { PATCH } = await import('../[id]/route')
    const req = mockRequest({ method: 'PATCH', body: { status: 'IN_PROGRESS' } })
    const res = await PATCH(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(200)
  })

  it('invalid transition rejected (CLOSED → IN_PROGRESS)', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.findUnique.mockResolvedValue({ ...existingTicket, status: 'CLOSED' })
    const { PATCH } = await import('../[id]/route')
    const req = mockRequest({ method: 'PATCH', body: { status: 'IN_PROGRESS' } })
    const res = await PATCH(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(400)
  })

  it('assigneeId update triggers event', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.update.mockResolvedValue({ ...existingTicket, assigneeId: 'user-2', portalUser: existingTicket.portalUser })
    const { PATCH } = await import('../[id]/route')
    const req = mockRequest({ method: 'PATCH', body: { assigneeId: 'user-2' } })
    const res = await PATCH(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(200)
    const { eventBus } = await import('@/lib/events')
    expect(eventBus.emit).toHaveBeenCalledWith('ticket.assigned', expect.objectContaining({ assigneeId: 'user-2' }))
  })

  it('returns 404 for non-existent ticket', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicket.findUnique.mockResolvedValue(null)
    const { PATCH } = await import('../[id]/route')
    const req = mockRequest({ method: 'PATCH', body: { status: 'IN_PROGRESS' } })
    const res = await PATCH(req, { params: { id: 'none' } })
    expect(res.status).toBe(404)
  })
})
