// src/lib/ai/predictions/types.ts
// AI Prediction Types

// ═══════════════════════════════════════════════════════════════
// TURNOVER PREDICTION
// ═══════════════════════════════════════════════════════════════

export interface TurnoverFactor {
  name: string
  weight: number
  score: number
  contribution: number
  description: string
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface TurnoverPrediction {
  employeeId: string
  employeeCode: string
  employeeName: string
  departmentName: string
  positionName: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: TurnoverFactor[]
  aiRecommendations: string[]
  predictedTimeframe: string
  confidence: number
  calculatedAt: Date
}

export interface TurnoverAnalysisResult {
  predictions: TurnoverPrediction[]
  summary: {
    totalAnalyzed: number
    criticalRisk: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    averageRiskScore: number
  }
  insights: {
    topRiskDepartments: Array<{ name: string; riskScore: number; employeeCount: number }>
    commonRiskFactors: Array<{ factor: string; frequency: number }>
    trendDirection: 'improving' | 'stable' | 'worsening'
  }
  generatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE PREDICTION
// ═══════════════════════════════════════════════════════════════

export interface PerformancePrediction {
  employeeId: string
  employeeCode: string
  employeeName: string
  currentRating: number
  predictedRating: number
  factors: PerformanceFactor[]
  recommendations: string[]
  confidence: number
  calculatedAt: Date
}

export interface PerformanceFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  score: number
  description: string
}

// ═══════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════

export interface PredictionContext {
  tenantId: string
  userId: string
  departmentId?: string
  limit?: number
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export function getRiskColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: 'text-green-600',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600'
  }
  return colors[level]
}

export function getRiskBadgeVariant(level: RiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<RiskLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    LOW: 'secondary',
    MEDIUM: 'outline',
    HIGH: 'default',
    CRITICAL: 'destructive'
  }
  return variants[level]
}
