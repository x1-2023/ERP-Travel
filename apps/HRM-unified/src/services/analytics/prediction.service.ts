// src/services/analytics/prediction.service.ts
// Turnover Prediction Service

import { predictTurnoverRisk } from '@/lib/analytics/predictors/turnover-risk'
import { db } from '@/lib/db'

export interface PredictionResult {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string
  tenure: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: Record<string, unknown>[]
  recommendations: string[]
  predictedAt: Date
  validUntil: Date
}

export async function getPredictions(
  tenantId: string
): Promise<PredictionResult[]> {
  const predictions = await db.turnoverPrediction.findMany({
    where: {
      tenantId,
      validUntil: { gte: new Date() },
    },
    include: {
      employee: {
        include: {
          department: true,
          position: true,
        },
      },
    },
    orderBy: { riskScore: 'desc' },
  })

  return predictions.map((p) => ({
    employeeId: p.employeeId,
    employeeName: p.employee.fullName,
    employeeCode: p.employee.employeeCode,
    department: p.employee.department?.name || 'Chưa phân bổ',
    position: p.employee.position?.name || 'Chưa xác định',
    tenure: 0,
    riskScore: Number(p.riskScore),
    riskLevel: p.riskLevel as PredictionResult['riskLevel'],
    factors: (p.factors as Record<string, unknown>[]) || [],
    recommendations: (p.recommendations as string[]) || [],
    predictedAt: p.predictedAt,
    validUntil: p.validUntil,
  }))
}

export async function calculatePredictions(
  tenantId: string
): Promise<PredictionResult[]> {
  // predictTurnoverRisk handles fetching all employees, scoring, and saving
  const results = await predictTurnoverRisk({ tenantId })

  return results.map((r) => ({
    employeeId: r.employeeId,
    employeeName: r.employeeName,
    employeeCode: r.employeeCode,
    department: r.department,
    position: r.position,
    tenure: r.tenure,
    riskScore: r.riskScore,
    riskLevel: r.riskLevel as PredictionResult['riskLevel'],
    factors: r.factors as Record<string, unknown>[],
    recommendations: r.recommendations,
    predictedAt: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }))
}

export const predictionService = {
  getPredictions,
  calculatePredictions,
}
