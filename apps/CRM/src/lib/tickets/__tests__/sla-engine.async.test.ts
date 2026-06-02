import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSlaConfig } = vi.hoisted(() => ({
  mockSlaConfig: { findUnique: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { slaConfig: mockSlaConfig },
}))

import { calculateSlaStatus } from '../sla-engine'

describe('calculateSlaStatus (async)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSlaConfig.findUnique.mockResolvedValue(null)
  })

  it('returns on_track for new ticket within SLA', async () => {
    const now = new Date()
    const sla = await calculateSlaStatus({
      priority: 'MEDIUM',
      createdAt: now,
      status: 'OPEN',
    })
    expect(sla.firstResponse.status).toBe('on_track')
    expect(sla.resolution.status).toBe('on_track')
    expect(sla.firstResponse.remaining).toBeGreaterThan(0)
  })

  it('returns breached when past deadline', async () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 3600_000)
    const sla = await calculateSlaStatus({
      priority: 'URGENT',
      createdAt: twoWeeksAgo,
      status: 'OPEN',
    })
    expect(sla.firstResponse.status).toBe('breached')
    expect(sla.resolution.status).toBe('breached')
  })

  it('returns met when responded before deadline', async () => {
    const createdAt = new Date('2025-01-01T10:00:00Z')
    const respondedAt = new Date('2025-01-01T10:30:00Z')
    const sla = await calculateSlaStatus({
      priority: 'MEDIUM',
      createdAt,
      firstResponseAt: respondedAt,
      status: 'OPEN',
    })
    expect(sla.firstResponse.status).toBe('met')
    expect(sla.firstResponse.actual).toBe(respondedAt.toISOString())
  })

  it('returns breached for late first response', async () => {
    const createdAt = new Date('2025-01-01T10:00:00Z')
    const respondedAt = new Date('2025-01-02T10:00:00Z')
    const sla = await calculateSlaStatus({
      priority: 'MEDIUM',
      createdAt,
      firstResponseAt: respondedAt,
      status: 'OPEN',
    })
    expect(sla.firstResponse.status).toBe('breached')
  })

  it('uses correct defaults per priority', async () => {
    const now = new Date()
    const createdAt = new Date(now.getTime() - 2 * 3600_000)

    const urgent = await calculateSlaStatus({ priority: 'URGENT', createdAt, status: 'OPEN' })
    expect(urgent.firstResponse.status).toBe('breached')

    const low = await calculateSlaStatus({ priority: 'LOW', createdAt, status: 'OPEN' })
    expect(low.firstResponse.status).toBe('on_track')
  })

  it('uses DB config when available', async () => {
    mockSlaConfig.findUnique.mockResolvedValue({
      priority: 'MEDIUM',
      firstResponseHours: 1,
      resolutionHours: 2,
    })

    const createdAt = new Date(Date.now() - 3 * 3600_000)
    const sla = await calculateSlaStatus({ priority: 'MEDIUM', createdAt, status: 'OPEN' })
    expect(sla.firstResponse.status).toBe('breached')
    expect(sla.resolution.status).toBe('breached')
  })

  it('marks met for closed tickets', async () => {
    const sla = await calculateSlaStatus({
      priority: 'MEDIUM',
      createdAt: new Date(),
      status: 'CLOSED',
    })
    expect(sla.firstResponse.status).toBe('met')
    expect(sla.resolution.status).toBe('met')
  })

  it('returns at_risk when approaching deadline', async () => {
    const createdAt = new Date(Date.now() - 7 * 3600_000)
    const sla = await calculateSlaStatus({ priority: 'MEDIUM', createdAt, status: 'OPEN' })
    expect(sla.firstResponse.status).toBe('at_risk')
  })
})
