import { prisma } from '@/lib/prisma'

// ── Types ────────────────────────────────────────────────────────────

export type SlaTimerStatus = 'on_track' | 'at_risk' | 'breached' | 'met'

export interface SlaTimer {
  target: string        // ISO deadline
  actual: string | null // ISO when fulfilled
  remaining: number     // ms remaining (negative = breached)
  status: SlaTimerStatus
}

export interface SlaStatus {
  firstResponse: SlaTimer
  resolution: SlaTimer
}

// ── Default SLA targets (fallback if no DB config) ───────────────────

const DEFAULTS: Record<string, { firstResponseHours: number; resolutionHours: number }> = {
  URGENT: { firstResponseHours: 1, resolutionHours: 4 },
  HIGH: { firstResponseHours: 4, resolutionHours: 24 },
  MEDIUM: { firstResponseHours: 8, resolutionHours: 48 },
  LOW: { firstResponseHours: 24, resolutionHours: 72 },
}

// ── SLA Calculation ──────────────────────────────────────────────────

export async function calculateSlaStatus(ticket: {
  priority: string
  createdAt: Date | string
  firstResponseAt?: Date | string | null
  resolvedAt?: Date | string | null
  status: string
}): Promise<SlaStatus> {
  // Fetch SLA config from DB
  const config = await prisma.slaConfig.findUnique({
    where: { priority: ticket.priority },
  })
  const targets = config || DEFAULTS[ticket.priority] || DEFAULTS.MEDIUM

  const createdAt = new Date(ticket.createdAt)
  const now = new Date()

  // At-risk threshold = 1 hour before deadline (or 25% of total time, min 30min)
  const atRiskThresholdMs = Math.max(
    targets.firstResponseHours * 3600000 * 0.25,
    30 * 60000
  )

  // First Response SLA
  const frDeadline = new Date(createdAt.getTime() + targets.firstResponseHours * 3600000)
  const frActual = ticket.firstResponseAt ? new Date(ticket.firstResponseAt) : null
  const firstResponse = computeTimer(frDeadline, frActual, now, atRiskThresholdMs)

  // Resolution SLA
  const resDeadline = new Date(createdAt.getTime() + targets.resolutionHours * 3600000)
  const resActual = ticket.resolvedAt ? new Date(ticket.resolvedAt) : null
  const resAtRiskMs = Math.max(targets.resolutionHours * 3600000 * 0.1, 3600000)
  const resolution = computeTimer(resDeadline, resActual, now, resAtRiskMs)

  // If ticket is closed/resolved, don't show on_track/at_risk
  if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    if (firstResponse.status === 'on_track' || firstResponse.status === 'at_risk') {
      firstResponse.status = frActual ? 'met' : 'met'
    }
    if (resolution.status === 'on_track' || resolution.status === 'at_risk') {
      resolution.status = 'met'
    }
  }

  return { firstResponse, resolution }
}

function computeTimer(
  deadline: Date,
  actual: Date | null,
  now: Date,
  atRiskThresholdMs: number
): SlaTimer {
  if (actual) {
    // Already fulfilled
    const met = actual.getTime() <= deadline.getTime()
    return {
      target: deadline.toISOString(),
      actual: actual.toISOString(),
      remaining: deadline.getTime() - actual.getTime(),
      status: met ? 'met' : 'breached',
    }
  }

  // Not yet fulfilled
  const remaining = deadline.getTime() - now.getTime()
  let status: SlaTimerStatus = 'on_track'
  if (remaining <= 0) {
    status = 'breached'
  } else if (remaining <= atRiskThresholdMs) {
    status = 'at_risk'
  }

  return {
    target: deadline.toISOString(),
    actual: null,
    remaining,
    status,
  }
}

// ── Format remaining time ────────────────────────────────────────────

export function formatRemaining(ms: number): string {
  const absMins = Math.abs(Math.floor(ms / 60000))
  if (absMins < 60) {
    return ms >= 0 ? `Còn ${absMins} phút` : `Trễ ${absMins} phút`
  }
  const hours = Math.floor(absMins / 60)
  const mins = absMins % 60
  if (hours < 24) {
    const suffix = mins > 0 ? ` ${mins}p` : ''
    return ms >= 0 ? `Còn ${hours} giờ${suffix}` : `Trễ ${hours} giờ${suffix}`
  }
  const days = Math.floor(hours / 24)
  const remainHours = hours % 24
  const suffix = remainHours > 0 ? ` ${remainHours}h` : ''
  return ms >= 0 ? `Còn ${days} ngày${suffix}` : `Trễ ${days} ngày${suffix}`
}

// ── Batch SLA check ──────────────────────────────────────────────────

export async function checkSlaBreaches(): Promise<{ breached: number; atRisk: number }> {
  const activeTickets = await prisma.supportTicket.findMany({
    where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'] } },
    select: {
      id: true, priority: true, createdAt: true,
      firstResponseAt: true, resolvedAt: true, status: true, slaBreached: true,
    },
  })

  let breached = 0
  let atRisk = 0

  for (const ticket of activeTickets) {
    const sla = await calculateSlaStatus(ticket)
    const isBreach = sla.firstResponse.status === 'breached' || sla.resolution.status === 'breached'
    const isAtRisk = sla.firstResponse.status === 'at_risk' || sla.resolution.status === 'at_risk'

    if (isBreach) breached++
    if (isAtRisk) atRisk++

    // Update breach flag if changed
    if (isBreach && !ticket.slaBreached) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { slaBreached: true },
      })
    }
  }

  return { breached, atRisk }
}
