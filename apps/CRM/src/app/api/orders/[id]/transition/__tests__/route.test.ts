import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockCurrentUser, mockRequest } from '@/test/mocks'

const { mockOrder, mockTx, mockRequireOwnerOrRole } = vi.hoisted(() => ({
  mockOrder: { findUnique: vi.fn() },
  mockTx: {
    salesOrder: { update: vi.fn(), findUnique: vi.fn() },
    orderStatusHistory: { create: vi.fn() },
  },
  mockRequireOwnerOrRole: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    salesOrder: mockOrder,
    $transaction: vi.fn(async (fn: any) => fn(mockTx)),
  },
}))

vi.mock('@/lib/auth/get-current-user', () => ({
  getCurrentUser: vi.fn(),
  AuthError: class AuthError extends Error {
    status: number
    constructor(msg: string, status = 401) { super(msg); this.status = status; this.name = 'AuthError' }
  },
}))

vi.mock('@/lib/auth/rbac', async () => {
  const actual = await vi.importActual('@/lib/auth/rbac') as any
  return { ...actual, requireOwnerOrRole: (...args: any[]) => mockRequireOwnerOrRole(...args) }
})

vi.mock('@/lib/events', () => ({
  eventBus: { emit: vi.fn().mockReturnValue({ catch: vi.fn() }) },
  CRM_EVENTS: { ORDER_STATUS_CHANGED: 'order.status_changed' },
}))

vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }))

import { POST } from '../route'

describe('POST /api/orders/[id]/transition', () => {
  const existing = { createdById: 'user-1', status: 'PENDING', total: 1000000, orderNumber: 'ORD-001' }

  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.findUnique.mockResolvedValue(existing)
    mockRequireOwnerOrRole.mockResolvedValue(mockCurrentUser())
    mockTx.salesOrder.update.mockResolvedValue({ ...existing, status: 'CONFIRMED' })
    mockTx.salesOrder.findUnique.mockResolvedValue({ ...existing, status: 'CONFIRMED' })
  })

  it('succeeds for valid transition PENDING → CONFIRMED', async () => {
    const req = mockRequest({ method: 'POST', body: { toStatus: 'CONFIRMED' } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(200)
  })

  it('rejects invalid transition PENDING → SHIPPED', async () => {
    const req = mockRequest({ method: 'POST', body: { toStatus: 'SHIPPED' } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(400)
  })

  it('CANCELLED requires cancellationReason', async () => {
    const req = mockRequest({ method: 'POST', body: { toStatus: 'CANCELLED' } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(400)
  })

  it('CANCELLED succeeds with reason', async () => {
    mockTx.salesOrder.update.mockResolvedValue({ ...existing, status: 'CANCELLED' })
    mockTx.salesOrder.findUnique.mockResolvedValue({ ...existing, status: 'CANCELLED' })
    const req = mockRequest({ method: 'POST', body: { toStatus: 'CANCELLED', cancellationReason: 'Customer request' } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(200)
  })

  it('REFUNDED requires refundAmount', async () => {
    mockOrder.findUnique.mockResolvedValue({ ...existing, status: 'DELIVERED' })
    const req = mockRequest({ method: 'POST', body: { toStatus: 'REFUNDED' } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(400)
  })

  it('rejects refundAmount > total', async () => {
    mockOrder.findUnique.mockResolvedValue({ ...existing, status: 'DELIVERED' })
    const req = mockRequest({ method: 'POST', body: { toStatus: 'REFUNDED', refundAmount: 9999999 } })
    const res = await POST(req, { params: { id: 'order-1' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 for non-existent order', async () => {
    mockOrder.findUnique.mockResolvedValue(null)
    const req = mockRequest({ method: 'POST', body: { toStatus: 'CONFIRMED' } })
    const res = await POST(req, { params: { id: 'nonexistent' } })
    expect(res.status).toBe(404)
  })
})
