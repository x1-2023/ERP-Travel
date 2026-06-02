// src/lib/ai/automation/smart-form.ts
// Smart Form Assistant

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import {
  SmartFormContext,
  SmartFormResult,
  FormSuggestion
} from './types'

// ═══════════════════════════════════════════════════════════════
// SMART FORM ASSISTANT CLASS
// ═══════════════════════════════════════════════════════════════

export class SmartFormAssistant {
  private client: Anthropic
  private tenantId: string

  constructor(tenantId: string) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    })
    this.tenantId = tenantId
  }

  /**
   * Get form suggestions based on context
   */
  async getSuggestions(context: SmartFormContext): Promise<SmartFormResult> {
    switch (context.formType) {
      case 'leave_request':
        return this.suggestLeaveRequest(context)
      case 'overtime_request':
        return this.suggestOvertimeRequest(context)
      case 'employee_create':
        return this.suggestEmployeeCreate(context)
      default:
        return { suggestions: [], warnings: [], recommendations: [] }
    }
  }

  /**
   * Suggest values for leave request form
   */
  private async suggestLeaveRequest(context: SmartFormContext): Promise<SmartFormResult> {
    const suggestions: FormSuggestion[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    const { employeeId } = context.userContext
    if (!employeeId) {
      return { suggestions, warnings, recommendations }
    }

    // Get employee's leave balances
    const leaveBalances = await db.leaveBalance.findMany({
      where: {
        tenantId: this.tenantId,
        employeeId,
        year: new Date().getFullYear()
      },
      include: {
        policy: { select: { id: true, name: true, leaveType: true } }
      }
    })

    // Suggest leave type based on available balance
    const sortedBalances = leaveBalances
      .filter(lb => Number(lb.available) > 0)
      .sort((a, b) => Number(b.available) - Number(a.available))

    if (sortedBalances.length > 0) {
      const topBalance = sortedBalances[0]
      suggestions.push({
        fieldName: 'leaveType',
        suggestedValue: topBalance.policy.leaveType,
        reason: `${topBalance.policy.name}: còn ${topBalance.available} ngày`,
        confidence: 0.8
      })
    }

    // Check for overlapping leave requests
    const startDate = context.currentValues.startDate as string
    const endDate = context.currentValues.endDate as string

    if (startDate && endDate) {
      const overlapping = await db.leaveRequest.findFirst({
        where: {
          employeeId,
          status: { in: ['PENDING', 'APPROVED'] },
          OR: [
            {
              startDate: { lte: new Date(endDate) },
              endDate: { gte: new Date(startDate) }
            }
          ]
        }
      })

      if (overlapping) {
        warnings.push(`Đã có đơn nghỉ phép trong khoảng thời gian này (${overlapping.startDate.toLocaleDateString('vi-VN')} - ${overlapping.endDate.toLocaleDateString('vi-VN')})`)
      }
    }

    // Suggest based on day of week
    const today = new Date()
    const dayOfWeek = today.getDay()

    if (dayOfWeek === 5) { // Friday
      recommendations.push('Gợi ý: Nghỉ thứ 6 kết hợp cuối tuần sẽ có 3 ngày nghỉ liên tiếp')
    }

    if (dayOfWeek === 1) { // Monday
      recommendations.push('Gợi ý: Nghỉ thứ 2 kết hợp cuối tuần sẽ có 3 ngày nghỉ liên tiếp')
    }

    // Check balance warnings
    const requestedDays = context.currentValues.totalDays as number
    const currentBalance = leaveBalances.find(
      lb => lb.policy.leaveType === context.currentValues.leaveType
    )

    if (currentBalance && requestedDays > Number(currentBalance.available)) {
      warnings.push(`Số ngày yêu cầu (${requestedDays}) vượt quá số ngày phép còn lại (${currentBalance.available})`)
    }

    return { suggestions, warnings, recommendations }
  }

  /**
   * Suggest values for overtime request form
   */
  private async suggestOvertimeRequest(context: SmartFormContext): Promise<SmartFormResult> {
    const suggestions: FormSuggestion[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    const { employeeId } = context.userContext
    if (!employeeId) {
      return { suggestions, warnings, recommendations }
    }

    // Get recent OT hours
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyOT = await db.attendance.aggregate({
      where: {
        tenantId: this.tenantId,
        employeeId,
        date: { gte: monthStart },
        otHours: { gt: 0 }
      },
      _sum: { otHours: true }
    })

    const currentMonthOT = Number(monthlyOT._sum.otHours || 0)

    if (currentMonthOT >= 30) {
      warnings.push(`Bạn đã tăng ca ${currentMonthOT} giờ trong tháng này. Theo quy định, tăng ca không nên vượt quá 40 giờ/tháng.`)
    }

    // Suggest common OT hours
    suggestions.push({
      fieldName: 'hours',
      suggestedValue: 2,
      reason: 'Thời gian tăng ca phổ biến',
      confidence: 0.6
    })

    return { suggestions, warnings, recommendations }
  }

  /**
   * Suggest values for employee creation form
   */
  private async suggestEmployeeCreate(context: SmartFormContext): Promise<SmartFormResult> {
    const suggestions: FormSuggestion[] = []
    const warnings: string[] = []
    const recommendations: string[] = []

    // Generate employee code suggestion
    const lastEmployee = await db.employee.findFirst({
      where: { tenantId: this.tenantId },
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true }
    })

    if (lastEmployee?.employeeCode) {
      // Extract number from code and increment
      const match = lastEmployee.employeeCode.match(/(\d+)$/)
      if (match) {
        const num = parseInt(match[1]) + 1
        const prefix = lastEmployee.employeeCode.replace(/\d+$/, '')
        const newCode = `${prefix}${num.toString().padStart(match[1].length, '0')}`

        suggestions.push({
          fieldName: 'employeeCode',
          suggestedValue: newCode,
          reason: `Mã tiếp theo sau ${lastEmployee.employeeCode}`,
          confidence: 0.9
        })
      }
    }

    // Suggest work email based on name
    const fullName = context.currentValues.fullName as string
    if (fullName) {
      const nameParts = fullName.toLowerCase().split(' ')
      if (nameParts.length >= 2) {
        const firstName = this.removeVietnameseAccent(nameParts[nameParts.length - 1])
        const lastName = this.removeVietnameseAccent(nameParts[0])
        const email = `${firstName}.${lastName}@company.com`

        suggestions.push({
          fieldName: 'workEmail',
          suggestedValue: email,
          reason: 'Email theo format chuẩn công ty',
          confidence: 0.7
        })
      }
    }

    // Default hire date
    suggestions.push({
      fieldName: 'hireDate',
      suggestedValue: new Date().toISOString().split('T')[0],
      reason: 'Ngày hiện tại',
      confidence: 0.5
    })

    return { suggestions, warnings, recommendations }
  }

  /**
   * Use AI to generate form suggestions
   */
  async getAISuggestions(
    formType: string,
    fieldDescription: string,
    context: Record<string, unknown>
  ): Promise<FormSuggestion[]> {
    try {
      const prompt = `Bạn là HR assistant. Đề xuất giá trị cho trường form sau:

Form: ${formType}
Trường: ${fieldDescription}
Context: ${JSON.stringify(context)}

Trả về JSON array các gợi ý:
[{
  "fieldName": "tên trường",
  "suggestedValue": "giá trị gợi ý",
  "reason": "lý do ngắn gọn",
  "confidence": 0.0-1.0
}]`

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      )

      if (textBlock?.text) {
        const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
    }

    return []
  }

  /**
   * Remove Vietnamese accents
   */
  private removeVietnameseAccent(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════

export function createSmartFormAssistant(tenantId: string): SmartFormAssistant {
  return new SmartFormAssistant(tenantId)
}
