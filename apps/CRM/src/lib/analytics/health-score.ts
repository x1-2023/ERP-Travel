/**
 * Deal Health Score Calculator
 *
 * Score 0-100, based on weighted factors:
 * - Activity recency (±20)
 * - Deal age / stage velocity (±15)
 * - Stakeholder engagement (+10)
 * - Documentation (+10)
 * - Compliance status (±5)
 */

function diffDays(a: Date, b: Date): number {
  return Math.abs(Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)))
}

export interface HealthScoreInput {
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date | null
  stage: { probability: number }
  contactCount: number
  documentCount: number
  complianceStatus: string | null
}

export function calculateHealthScore(deal: HealthScoreInput): number {
  const now = new Date()
  let score = 50 // base

  // 1. Activity recency (max ±20)
  const daysSinceActivity = diffDays(now, deal.lastActivityAt || deal.updatedAt)
  if (daysSinceActivity <= 3) score += 20
  else if (daysSinceActivity <= 7) score += 10
  else if (daysSinceActivity <= 14) score += 0
  else if (daysSinceActivity <= 30) score -= 10
  else score -= 20

  // 2. Deal age (max ±15)
  const dealAgeDays = diffDays(now, deal.createdAt)
  if (dealAgeDays < 30) score += 10
  else if (dealAgeDays < 60) score += 5
  else if (dealAgeDays < 120) score += 0
  else if (dealAgeDays < 180) score -= 5
  else score -= 15

  // 3. Stakeholder engagement (max +10)
  if (deal.contactCount >= 3) score += 10
  else if (deal.contactCount >= 1) score += 5

  // 4. Documentation (max +10)
  if (deal.documentCount >= 3) score += 10
  else if (deal.documentCount >= 1) score += 5

  // 5. Compliance (max ±5)
  if (deal.complianceStatus === 'CLEAR') score += 5
  else if (deal.complianceStatus === 'FLAGGED') score -= 5

  return Math.max(0, Math.min(100, score))
}

export function getHealthColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

export const HEALTH_COLORS = {
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
} as const
