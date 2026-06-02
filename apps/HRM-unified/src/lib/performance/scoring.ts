import { DEFAULT_REVIEW_WEIGHTS } from './constants'

export function calculateGoalProgress(
  currentValue: number,
  targetValue: number
): number {
  if (targetValue <= 0) return 0
  const progress = (currentValue / targetValue) * 100
  return Math.min(Math.max(Math.round(progress), 0), 100)
}

export function calculateGoalScore(progress: number): number {
  if (progress >= 100) return 5
  if (progress >= 80) return 4
  if (progress >= 60) return 3
  if (progress >= 40) return 2
  return 1
}

export function calculateWeightedAverage(
  items: { score: number; weight: number }[]
): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight === 0) return 0

  const weightedSum = items.reduce((sum, item) => sum + item.score * item.weight, 0)
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

export function calculateOverallReviewScore(
  goalScore: number | null,
  competencyScore: number | null,
  valuesScore: number | null,
  feedbackScore: number | null,
  weights: {
    goal: number
    competency: number
    values: number
    feedback: number
  } = DEFAULT_REVIEW_WEIGHTS
): number {
  const items: { score: number; weight: number }[] = []

  if (goalScore !== null) items.push({ score: goalScore, weight: weights.goal })
  if (competencyScore !== null) items.push({ score: competencyScore, weight: weights.competency })
  if (valuesScore !== null) items.push({ score: valuesScore, weight: weights.values })
  if (feedbackScore !== null) items.push({ score: feedbackScore, weight: weights.feedback })

  return calculateWeightedAverage(items)
}

export function scoreToRating(score: number): number {
  return Math.min(Math.max(Math.round(score), 1), 5)
}

export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 5: return 'Exceptional'
    case 4: return 'Exceeds'
    case 3: return 'Meets'
    case 2: return 'Developing'
    case 1: return 'Unsatisfactory'
    default: return 'N/A'
  }
}

export function getRatingColor(rating: number): string {
  switch (rating) {
    case 5: return '#22c55e'
    case 4: return '#84cc16'
    case 3: return '#eab308'
    case 2: return '#f97316'
    case 1: return '#ef4444'
    default: return '#6b7280'
  }
}
