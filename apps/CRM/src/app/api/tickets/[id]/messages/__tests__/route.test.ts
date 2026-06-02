import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockTicketModel, mockMessageModel, mockGetCurrentUser } = vi.hoisted(() => ({
  mockTicketModel: { findUnique: vi.fn(), update: vi.fn() },
  mockMessageModel: { create: vi.fn() },
  mockGetCurrentUser: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { supportTicket: mockTicketModel, ticketMessage: mockMessageModel },
}))

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

vi.mock('@/lib/events', () => ({
  eventBus: { emit: vi.fn().mockReturnValue({ catch: vi.fn() }) },
  CRM_EVENTS: { TICKET_STAFF_REPLIED: 'ticket.staff_replied' },
}))

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

import { POST } from '../route'

describe('POST /api/tickets/[id]/messages', () => {
  const ticket = { id: 'ticket-1', status: 'OPEN', subject: 'Test', assigneeId: null, portalUser: { firstName: 'Portal', lastName: 'User' } }
  const createdMsg = { id: 'msg-1', content: 'Reply', isInternal: false, user: { id: 'user-1', name: 'Test User', avatarUrl: null } }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'MANAGER' }))
    mockTicketModel.findUnique.mockResolvedValue(ticket)
    mockMessageModel.create.mockResolvedValue(createdMsg)
  })

  it('creates public message', async () => {
    const req = mockRequest({ method: 'POST', body: { content: 'Public reply', isInternal: false } })
    const res = await POST(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(201)
    expect(mockMessageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: 'Public reply', isInternal: false }) })
    )
  })

  it('creates internal note', async () => {
    mockMessageModel.create.mockResolvedValue({ ...createdMsg, isInternal: true })
    const req = mockRequest({ method: 'POST', body: { content: 'Internal note', isInternal: true } })
    const res = await POST(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(201)
    expect(mockMessageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isInternal: true }) })
    )
  })

  it('first public reply sets firstResponseAt', async () => {
    mockTicketModel.findUnique
      .mockResolvedValueOnce(ticket)
      .mockResolvedValueOnce({ firstResponseAt: null })
    const req = mockRequest({ method: 'POST', body: { content: 'First reply' } })
    await POST(req, { params: { id: 'ticket-1' } })
    expect(mockTicketModel.update).toHaveBeenCalled()
  })

  it('returns 404 for non-existent ticket', async () => {
    mockTicketModel.findUnique.mockResolvedValue(null)
    const req = mockRequest({ method: 'POST', body: { content: 'Reply' } })
    const res = await POST(req, { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })

  it('VIEWER gets 403', async () => {
    mockGetCurrentUser.mockResolvedValue(mockCurrentUser({ role: 'VIEWER' }))
    const req = mockRequest({ method: 'POST', body: { content: 'Reply' } })
    const res = await POST(req, { params: { id: 'ticket-1' } })
    expect(res.status).toBe(403)
  })
})
