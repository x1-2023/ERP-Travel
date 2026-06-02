// src/lib/ai/predictions/turnover-predictor.ts
// Turnover Risk Prediction Engine

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import {
  TurnoverPrediction,
  TurnoverFactor,
  TurnoverAnalysisResult,
  PredictionContext,
  getRiskLevel
} from './types'

// ═══════════════════════════════════════════════════════════════
// FACTOR WEIGHTS (Total = 100)
// ═══════════════════════════════════════════════════════════════

const FACTOR_WEIGHTS = {
  tenure: 15,           // Thâm niên
  attendance: 20,       // Chấm công
  leaveUsage: 10,       // Sử dụng phép
  salaryCompetitive: 20,// Lương cạnh tranh
  performance: 15,      // Hiệu suất
  managerRelation: 10,  // Quan hệ với quản lý
  careerProgress: 10    // Tiến bộ nghề nghiệp
}

// ═══════════════════════════════════════════════════════════════
// TURNOVER PREDICTOR CLASS
// ═══════════════════════════════════════════════════════════════

export class TurnoverPredictor {
  private client: Anthropic
  private tenantId: string

  constructor(tenantId: string) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.tenantId = tenantId
  }

  /**
   * Analyze turnover risk for employees
   */
  async analyzeTurnoverRisk(
    context: PredictionContext
  ): Promise<TurnoverAnalysisResult> {
    // Fetch employees to analyze
    const employees = await this.fetchEmployeesForAnalysis(context)

    // Calculate predictions for each employee
    const predictions: TurnoverPrediction[] = []

    for (const employee of employees) {
      const prediction = await this.predictSingleEmployee(employee)
      predictions.push(prediction)
    }

    // Sort by risk score descending
    predictions.sort((a, b) => b.riskScore - a.riskScore)

    // Generate summary and insights
    const summary = this.generateSummary(predictions)
    const insights = this.generateInsights(predictions)

    return {
      predictions: predictions.slice(0, context.limit || 20),
      summary,
      insights,
      generatedAt: new Date()
    }
  }

  /**
   * Predict turnover risk for single employee
   */
  async predictSingleEmployee(employee: EmployeeData): Promise<TurnoverPrediction> {
    const factors = await this.calculateFactors(employee)
    const riskScore = this.calculateOverallScore(factors)
    const recommendations = await this.generateRecommendations(employee, factors, riskScore)

    return {
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.fullName,
      departmentName: employee.department?.name || 'N/A',
      positionName: employee.position?.name || 'N/A',
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      factors,
      aiRecommendations: recommendations,
      predictedTimeframe: this.getPredictedTimeframe(riskScore),
      confidence: this.calculateConfidence(factors),
      calculatedAt: new Date()
    }
  }

  /**
   * Fetch employees for analysis
   */
  private async fetchEmployeesForAnalysis(
    context: PredictionContext
  ): Promise<EmployeeData[]> {
    const where: Record<string, unknown> = {
      tenantId: this.tenantId,
      status: { in: ['ACTIVE', 'PROBATION'] },
      deletedAt: null
    }

    if (context.departmentId) {
      where.departmentId = context.departmentId
    }

    const employees = await db.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } },
        contracts: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
          take: 1
        },
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
            }
          }
        },
        leaveRequests: {
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        leaveBalances: {
          where: { year: new Date().getFullYear() }
        }
      },
      take: context.limit ? context.limit * 2 : 100
    })

    return employees as EmployeeData[]
  }

  /**
   * Calculate all risk factors
   */
  private async calculateFactors(employee: EmployeeData): Promise<TurnoverFactor[]> {
    const factors: TurnoverFactor[] = []

    // 1. Tenure Factor
    factors.push(this.calculateTenureFactor(employee))

    // 2. Attendance Factor
    factors.push(this.calculateAttendanceFactor(employee))

    // 3. Leave Usage Factor
    factors.push(this.calculateLeaveUsageFactor(employee))

    // 4. Salary Competitiveness Factor
    factors.push(await this.calculateSalaryFactor(employee))

    // 5. Performance Factor
    factors.push(await this.calculatePerformanceFactor(employee))

    // 6. Manager Relation Factor
    factors.push(await this.calculateManagerRelationFactor(employee))

    // 7. Career Progress Factor
    factors.push(this.calculateCareerProgressFactor(employee))

    return factors
  }

  /**
   * Tenure Factor (0-100)
   * Short tenure = higher risk
   */
  private calculateTenureFactor(employee: EmployeeData): TurnoverFactor {
    const hireDate = new Date(employee.hireDate)
    const monthsWorked = Math.floor(
      (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    let score: number
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    if (monthsWorked < 6) {
      score = 80
      description = 'Nhân viên mới (< 6 tháng), rủi ro cao trong giai đoạn thử việc'
      trend = 'decreasing' // Risk decreases as tenure increases
    } else if (monthsWorked < 12) {
      score = 60
      description = 'Thâm niên ngắn (6-12 tháng), chưa ổn định'
      trend = 'decreasing'
    } else if (monthsWorked < 24) {
      score = 40
      description = 'Thâm niên trung bình (1-2 năm)'
      trend = 'stable'
    } else if (monthsWorked < 36) {
      score = 25
      description = 'Thâm niên tốt (2-3 năm), tương đối ổn định'
      trend = 'stable'
    } else {
      score = 15
      description = 'Thâm niên cao (> 3 năm), gắn bó với công ty'
      trend = 'stable'
    }

    const contribution = (score * FACTOR_WEIGHTS.tenure) / 100

    return {
      name: 'Thâm niên',
      weight: FACTOR_WEIGHTS.tenure,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Attendance Factor (0-100)
   * Poor attendance = higher risk
   */
  private calculateAttendanceFactor(employee: EmployeeData): TurnoverFactor {
    const attendances = employee.attendances || []

    if (attendances.length === 0) {
      return {
        name: 'Chấm công',
        weight: FACTOR_WEIGHTS.attendance,
        score: 30,
        contribution: (30 * FACTOR_WEIGHTS.attendance) / 100,
        description: 'Không đủ dữ liệu chấm công',
        trend: 'stable'
      }
    }

    const totalDays = attendances.length
    const lateDays = attendances.filter(a =>
      ['LATE', 'LATE_AND_EARLY'].includes(a.status)
    ).length
    const absentDays = attendances.filter(a => a.status === 'ABSENT').length
    const earlyLeaveDays = attendances.filter(a =>
      ['EARLY_LEAVE', 'LATE_AND_EARLY'].includes(a.status)
    ).length

    const lateRate = (lateDays / totalDays) * 100
    const absentRate = (absentDays / totalDays) * 100
    const earlyRate = (earlyLeaveDays / totalDays) * 100

    // Calculate score
    let score = 0
    score += Math.min(lateRate * 3, 40)    // Late contributes up to 40
    score += Math.min(absentRate * 10, 40)  // Absent contributes up to 40
    score += Math.min(earlyRate * 2, 20)    // Early leave contributes up to 20

    score = Math.min(score, 100)

    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    if (score >= 60) {
      description = `Chấm công kém: ${lateDays} ngày muộn, ${absentDays} ngày vắng, ${earlyLeaveDays} ngày về sớm`
      trend = 'increasing'
    } else if (score >= 30) {
      description = `Chấm công trung bình: ${lateDays} ngày muộn, ${absentDays} ngày vắng`
      trend = 'stable'
    } else {
      description = 'Chấm công tốt, tuân thủ giờ giấc'
      trend = 'stable'
    }

    const contribution = (score * FACTOR_WEIGHTS.attendance) / 100

    return {
      name: 'Chấm công',
      weight: FACTOR_WEIGHTS.attendance,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Leave Usage Factor (0-100)
   * Excessive leave or burnout patterns = higher risk
   */
  private calculateLeaveUsageFactor(employee: EmployeeData): TurnoverFactor {
    const leaveRequests = employee.leaveRequests || []
    const leaveBalances = employee.leaveBalances || []

    if (leaveBalances.length === 0) {
      return {
        name: 'Sử dụng phép',
        weight: FACTOR_WEIGHTS.leaveUsage,
        score: 20,
        contribution: (20 * FACTOR_WEIGHTS.leaveUsage) / 100,
        description: 'Không có dữ liệu phép',
        trend: 'stable'
      }
    }

    // Calculate usage patterns
    const totalEntitlement = leaveBalances.reduce((sum, lb) => sum + Number(lb.entitlement), 0)
    const totalUsed = leaveBalances.reduce((sum, lb) => sum + Number(lb.used), 0)
    const usageRate = totalEntitlement > 0 ? (totalUsed / totalEntitlement) * 100 : 0

    // Check for sudden increase in leave requests
    const recentLeaves = leaveRequests.filter(lr =>
      new Date(lr.createdAt) > new Date(new Date().setMonth(new Date().getMonth() - 1))
    ).length

    let score = 0
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    // Very low usage might indicate burnout risk
    if (usageRate < 10 && totalEntitlement > 5) {
      score = 40
      description = 'Sử dụng phép rất ít, có thể có dấu hiệu kiệt sức'
      trend = 'increasing'
    }
    // High usage might indicate disengagement
    else if (usageRate > 80) {
      score = 50
      description = 'Đã sử dụng hầu hết ngày phép trong năm'
      trend = 'increasing'
    }
    // Sudden increase in leave requests
    else if (recentLeaves >= 3) {
      score = 60
      description = `Tăng đột biến số đơn nghỉ phép (${recentLeaves} đơn trong tháng)`
      trend = 'increasing'
    }
    // Normal usage
    else if (usageRate >= 30 && usageRate <= 70) {
      score = 15
      description = 'Sử dụng phép hợp lý, cân bằng công việc-cuộc sống'
      trend = 'stable'
    }
    else {
      score = 25
      description = `Đã sử dụng ${Math.round(usageRate)}% ngày phép năm`
      trend = 'stable'
    }

    const contribution = (score * FACTOR_WEIGHTS.leaveUsage) / 100

    return {
      name: 'Sử dụng phép',
      weight: FACTOR_WEIGHTS.leaveUsage,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Salary Competitiveness Factor (0-100)
   * Below market rate = higher risk
   */
  private async calculateSalaryFactor(employee: EmployeeData): Promise<TurnoverFactor> {
    const contract = employee.contracts?.[0]

    if (!contract) {
      return {
        name: 'Lương cạnh tranh',
        weight: FACTOR_WEIGHTS.salaryCompetitive,
        score: 50,
        contribution: (50 * FACTOR_WEIGHTS.salaryCompetitive) / 100,
        description: 'Không có thông tin hợp đồng',
        trend: 'stable'
      }
    }

    // Get department average
    const departmentAvg = await db.contract.aggregate({
      where: {
        tenantId: this.tenantId,
        status: 'ACTIVE',
        employee: {
          departmentId: employee.departmentId,
          status: { in: ['ACTIVE', 'PROBATION'] }
        }
      },
      _avg: { baseSalary: true }
    })

    const currentSalary = Number(contract.baseSalary)
    const avgSalary = Number(departmentAvg._avg.baseSalary || currentSalary)
    const salaryRatio = avgSalary > 0 ? (currentSalary / avgSalary) * 100 : 100

    let score: number
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    if (salaryRatio < 80) {
      score = 80
      description = `Lương thấp hơn ${Math.round(100 - salaryRatio)}% so với trung bình phòng ban`
      trend = 'increasing'
    } else if (salaryRatio < 95) {
      score = 50
      description = `Lương thấp hơn trung bình phòng ban ${Math.round(100 - salaryRatio)}%`
      trend = 'stable'
    } else if (salaryRatio < 110) {
      score = 20
      description = 'Lương cạnh tranh, ngang với thị trường'
      trend = 'stable'
    } else {
      score = 10
      description = `Lương cao hơn trung bình ${Math.round(salaryRatio - 100)}%`
      trend = 'decreasing'
    }

    const contribution = (score * FACTOR_WEIGHTS.salaryCompetitive) / 100

    return {
      name: 'Lương cạnh tranh',
      weight: FACTOR_WEIGHTS.salaryCompetitive,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Performance Factor (0-100)
   * Low performance OR very high performance = risk
   */
  private async calculatePerformanceFactor(employee: EmployeeData): Promise<TurnoverFactor> {
    // Get latest performance review
    const latestReview = await db.performanceReview.findFirst({
      where: {
        employeeId: employee.id,
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!latestReview) {
      return {
        name: 'Hiệu suất',
        weight: FACTOR_WEIGHTS.performance,
        score: 30,
        contribution: (30 * FACTOR_WEIGHTS.performance) / 100,
        description: 'Chưa có đánh giá hiệu suất',
        trend: 'stable'
      }
    }

    const rating = Number(latestReview.finalRating || latestReview.managerRating || latestReview.overallScore || 3)
    let score: number
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    // Low performers might leave or be managed out
    if (rating < 2.5) {
      score = 70
      description = 'Hiệu suất thấp, có thể không phù hợp với vị trí'
      trend = 'increasing'
    }
    // High performers might leave for better opportunities
    else if (rating >= 4.5) {
      score = 40
      description = 'Hiệu suất xuất sắc, cần chú ý giữ chân'
      trend = 'stable'
    }
    // Average performers are relatively stable
    else if (rating >= 3.5) {
      score = 15
      description = 'Hiệu suất tốt, đáp ứng kỳ vọng'
      trend = 'decreasing'
    }
    else {
      score = 35
      description = 'Hiệu suất trung bình, cần cải thiện'
      trend = 'stable'
    }

    const contribution = (score * FACTOR_WEIGHTS.performance) / 100

    return {
      name: 'Hiệu suất',
      weight: FACTOR_WEIGHTS.performance,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Manager Relation Factor (0-100)
   * Based on approval patterns and feedback
   */
  private async calculateManagerRelationFactor(employee: EmployeeData): Promise<TurnoverFactor> {
    if (!employee.directManagerId) {
      return {
        name: 'Quan hệ quản lý',
        weight: FACTOR_WEIGHTS.managerRelation,
        score: 30,
        contribution: (30 * FACTOR_WEIGHTS.managerRelation) / 100,
        description: 'Không có quản lý trực tiếp',
        trend: 'stable'
      }
    }

    // Get leave request approval rate
    const approvedRequests = employee.leaveRequests?.filter(lr =>
      lr.status === 'APPROVED'
    ).length || 0
    const totalRequests = employee.leaveRequests?.length || 0
    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 50

    let score: number
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    // Low approval rate suggests potential issues
    if (approvalRate < 50 && totalRequests >= 3) {
      score = 60
      description = 'Tỷ lệ duyệt đơn thấp, có thể có vấn đề với quản lý'
      trend = 'increasing'
    } else if (approvalRate < 70) {
      score = 40
      description = 'Một số đơn từ bị từ chối'
      trend = 'stable'
    } else {
      score = 15
      description = 'Quan hệ tốt với quản lý, đơn từ được xử lý nhanh'
      trend = 'stable'
    }

    const contribution = (score * FACTOR_WEIGHTS.managerRelation) / 100

    return {
      name: 'Quan hệ quản lý',
      weight: FACTOR_WEIGHTS.managerRelation,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Career Progress Factor (0-100)
   * Stagnation = higher risk
   */
  private calculateCareerProgressFactor(employee: EmployeeData): TurnoverFactor {
    const hireDate = new Date(employee.hireDate)
    const yearsWorked = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

    // Check for position changes (simplified - based on contract history)
    const contracts = employee.contracts || []
    const positionChanges = contracts.length - 1 // Number of contract changes as proxy

    const changeRate = yearsWorked > 0 ? positionChanges / yearsWorked : 0

    let score: number
    let description: string
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'

    // Long tenure with no progression
    if (yearsWorked >= 3 && positionChanges === 0) {
      score = 60
      description = 'Không có tiến bộ nghề nghiệp trong 3+ năm'
      trend = 'increasing'
    }
    // Good progression rate
    else if (changeRate >= 0.5) {
      score = 10
      description = 'Có tiến bộ nghề nghiệp đều đặn'
      trend = 'decreasing'
    }
    // Some progression
    else if (positionChanges >= 1) {
      score = 25
      description = 'Có một số tiến bộ nghề nghiệp'
      trend = 'stable'
    }
    // New employee
    else if (yearsWorked < 1) {
      score = 20
      description = 'Nhân viên mới, chưa đến thời điểm thăng tiến'
      trend = 'stable'
    }
    else {
      score = 40
      description = 'Chưa có sự tiến bộ rõ rệt'
      trend = 'increasing'
    }

    const contribution = (score * FACTOR_WEIGHTS.careerProgress) / 100

    return {
      name: 'Tiến bộ nghề nghiệp',
      weight: FACTOR_WEIGHTS.careerProgress,
      score,
      contribution,
      description,
      trend
    }
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallScore(factors: TurnoverFactor[]): number {
    const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0)
    return Math.round(Math.min(totalContribution, 100))
  }

  /**
   * Generate AI recommendations
   */
  private async generateRecommendations(
    employee: EmployeeData,
    factors: TurnoverFactor[],
    riskScore: number
  ): Promise<string[]> {
    // Sort factors by contribution (highest risk first)
    const topFactors = [...factors]
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3)

    try {
      const prompt = `Dựa trên phân tích rủi ro nghỉ việc của nhân viên ${employee.fullName}:
- Điểm rủi ro: ${riskScore}/100
- Các yếu tố rủi ro chính:
${topFactors.map(f => `  * ${f.name}: ${f.score}/100 - ${f.description}`).join('\n')}

Đề xuất 3 hành động cụ thể để giảm rủi ro nghỉ việc.
Mỗi đề xuất phải ngắn gọn (1 câu), thực tế và có thể thực hiện được.
Trả về JSON array: ["đề xuất 1", "đề xuất 2", "đề xuất 3"]`

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      )

      if (textBlock?.text) {
        const jsonMatch = textBlock.text.match(/\[[\s\S]*?\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    }

    // Fallback recommendations based on top factor
    return this.getFallbackRecommendations(topFactors[0]?.name, riskScore)
  }

  /**
   * Get fallback recommendations
   */
  private getFallbackRecommendations(topFactor: string, riskScore: number): string[] {
    const recommendations: Record<string, string[]> = {
      'Thâm niên': [
        'Tổ chức buổi onboarding 1-1 để hiểu kỳ vọng của nhân viên',
        'Phân công mentor hỗ trợ trong 6 tháng đầu',
        'Đánh giá và feedback thường xuyên hơn'
      ],
      'Chấm công': [
        'Trao đổi để hiểu nguyên nhân đi muộn/vắng mặt',
        'Xem xét điều chỉnh giờ làm linh hoạt nếu phù hợp',
        'Kiểm tra sức khỏe và tình trạng gia đình'
      ],
      'Lương cạnh tranh': [
        'Xem xét điều chỉnh lương theo thị trường',
        'Bổ sung phúc lợi phi tài chính',
        'Thảo luận lộ trình tăng lương rõ ràng'
      ],
      'Hiệu suất': [
        'Đặt mục tiêu rõ ràng và có thể đo lường',
        'Cung cấp đào tạo nâng cao kỹ năng',
        'Trao đổi về cơ hội phát triển'
      ],
      'Tiến bộ nghề nghiệp': [
        'Xây dựng lộ trình phát triển cá nhân',
        'Tạo cơ hội tham gia dự án mới',
        'Thảo luận về mục tiêu nghề nghiệp dài hạn'
      ]
    }

    return recommendations[topFactor] || [
      'Tổ chức buổi trao đổi 1-1 để hiểu mong muốn của nhân viên',
      'Đánh giá và cải thiện môi trường làm việc',
      'Xem xét các chương trình phát triển phù hợp'
    ]
  }

  /**
   * Get predicted timeframe
   */
  private getPredictedTimeframe(riskScore: number): string {
    if (riskScore >= 80) return 'Có thể trong 1-3 tháng tới'
    if (riskScore >= 60) return 'Có thể trong 3-6 tháng tới'
    if (riskScore >= 40) return 'Có thể trong 6-12 tháng tới'
    return 'Ổn định trong năm tới'
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(factors: TurnoverFactor[]): number {
    // Higher confidence if more data is available
    const factorsWithData = factors.filter(f => !f.description.includes('Không đủ dữ liệu') && !f.description.includes('Không có'))
    return Math.round((factorsWithData.length / factors.length) * 100)
  }

  /**
   * Generate summary
   */
  private generateSummary(predictions: TurnoverPrediction[]): TurnoverAnalysisResult['summary'] {
    const total = predictions.length
    const avgScore = total > 0
      ? Math.round(predictions.reduce((sum, p) => sum + p.riskScore, 0) / total)
      : 0

    return {
      totalAnalyzed: total,
      criticalRisk: predictions.filter(p => p.riskLevel === 'CRITICAL').length,
      highRisk: predictions.filter(p => p.riskLevel === 'HIGH').length,
      mediumRisk: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
      lowRisk: predictions.filter(p => p.riskLevel === 'LOW').length,
      averageRiskScore: avgScore
    }
  }

  /**
   * Generate insights
   */
  private generateInsights(predictions: TurnoverPrediction[]): TurnoverAnalysisResult['insights'] {
    // Top risk departments
    const deptRisks = new Map<string, { total: number; count: number }>()
    for (const p of predictions) {
      const current = deptRisks.get(p.departmentName) || { total: 0, count: 0 }
      deptRisks.set(p.departmentName, {
        total: current.total + p.riskScore,
        count: current.count + 1
      })
    }

    const topRiskDepartments = Array.from(deptRisks.entries())
      .map(([name, data]) => ({
        name,
        riskScore: Math.round(data.total / data.count),
        employeeCount: data.count
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)

    // Common risk factors
    const factorCounts = new Map<string, number>()
    for (const p of predictions) {
      const topFactor = p.factors.sort((a, b) => b.contribution - a.contribution)[0]
      if (topFactor && topFactor.score >= 50) {
        const current = factorCounts.get(topFactor.name) || 0
        factorCounts.set(topFactor.name, current + 1)
      }
    }

    const commonRiskFactors = Array.from(factorCounts.entries())
      .map(([factor, frequency]) => ({ factor, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)

    // Trend direction
    const avgScore = predictions.reduce((sum, p) => sum + p.riskScore, 0) / (predictions.length || 1)
    const increasingFactors = predictions.reduce((sum, p) => {
      return sum + p.factors.filter(f => f.trend === 'increasing').length
    }, 0)
    const decreasingFactors = predictions.reduce((sum, p) => {
      return sum + p.factors.filter(f => f.trend === 'decreasing').length
    }, 0)

    let trendDirection: 'improving' | 'stable' | 'worsening' = 'stable'
    if (increasingFactors > decreasingFactors * 1.5) {
      trendDirection = 'worsening'
    } else if (decreasingFactors > increasingFactors * 1.5) {
      trendDirection = 'improving'
    }

    return {
      topRiskDepartments,
      commonRiskFactors,
      trendDirection
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL TYPES
// ═══════════════════════════════════════════════════════════════

interface EmployeeData {
  id: string
  employeeCode: string
  fullName: string
  hireDate: Date
  departmentId: string | null
  directManagerId: string | null
  department?: { id: string; name: string } | null
  position?: { id: string; name: string } | null
  contracts?: Array<{
    baseSalary: number | unknown
    startDate: Date
    status: string
  }>
  attendances?: Array<{
    status: string
    date: Date
  }>
  leaveRequests?: Array<{
    status: string
    createdAt: Date
  }>
  leaveBalances?: Array<{
    entitlement: number | unknown
    used: number | unknown
    available: number | unknown
  }>
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createTurnoverPredictor(tenantId: string): TurnoverPredictor {
  return new TurnoverPredictor(tenantId)
}
