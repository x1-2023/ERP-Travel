// src/app/api/notifications/ai-summary/route.ts
// AI-Powered Notification Summary

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { notificationService } from '@/services/notification.service'

interface NotificationSummary {
  totalUnread: number
  criticalCount: number
  byCategory: Record<string, number>
  aiSummary: string
  topPriorities: Array<{
    id: string
    title: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    suggestedAction: string
  }>
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable'
    percentChange: number
    message: string
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notifications
    const { data: notifications } = await notificationService.getByUser(
      session.user.id,
      { pageSize: 100 }
    )

    // Calculate stats
    const unread = notifications.filter((n: { isRead: boolean }) => !n.isRead)
    const totalUnread = unread.length

    // Count by type (simulating categories)
    const byCategory: Record<string, number> = {
      approval: 0,
      system: 0,
      reminder: 0,
      update: 0,
    }

    const criticalTypes = ['PENDING_APPROVAL', 'REQUEST_REJECTED', 'BALANCE_LOW']
    let criticalCount = 0

    notifications.forEach((n: { type: string; isRead: boolean }) => {
      if (!n.isRead && criticalTypes.includes(n.type)) {
        criticalCount++
      }

      switch (n.type) {
        case 'PENDING_APPROVAL':
        case 'REQUEST_APPROVED':
        case 'REQUEST_REJECTED':
        case 'REQUEST_SUBMITTED':
        case 'REQUEST_CANCELLED':
          byCategory.approval++
          break
        case 'DELEGATION_ASSIGNED':
          byCategory.system++
          break
        case 'BALANCE_LOW':
          byCategory.reminder++
          break
        default:
          byCategory.update++
      }
    })

    // Generate AI summary
    const aiSummary = generateAISummary(totalUnread, criticalCount, byCategory)

    // Get top priorities
    const topPriorities = unread
      .slice(0, 5)
      .map((n: { id: string; title: string; type: string; message: string }) => ({
        id: n.id,
        title: n.title,
        priority: getPriority(n.type),
        suggestedAction: getSuggestedAction(n.type, n.message),
      }))

    // Calculate trends (mock data for demo)
    const direction: 'increasing' | 'decreasing' | 'stable' =
      totalUnread > 5 ? 'increasing' : totalUnread < 2 ? 'decreasing' : 'stable'
    const trends = {
      direction,
      percentChange: Math.round(Math.random() * 30),
      message: getTrendMessage(totalUnread),
    }

    const summary: NotificationSummary = {
      totalUnread,
      criticalCount,
      byCategory,
      aiSummary,
      topPriorities,
      trends,
    }

    return NextResponse.json({ data: summary })
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    )
  }
}

function generateAISummary(
  totalUnread: number,
  criticalCount: number,
  byCategory: Record<string, number>
): string {
  if (totalUnread === 0) {
    return 'Bạn đã xử lý tất cả thông báo. Làm việc hiệu quả!'
  }

  const parts: string[] = []

  if (criticalCount > 0) {
    parts.push(`${criticalCount} thông báo khẩn cấp cần xử lý ngay`)
  }

  if (byCategory.approval > 0) {
    parts.push(`${byCategory.approval} yêu cầu đang chờ phê duyệt`)
  }

  if (byCategory.reminder > 0) {
    parts.push(`${byCategory.reminder} nhắc nhở quan trọng`)
  }

  if (parts.length === 0) {
    return `Bạn có ${totalUnread} thông báo chưa đọc. AI đề xuất xem xét các thông báo mới nhất trước.`
  }

  return parts.join('. ') + '.'
}

function getPriority(type: string): 'critical' | 'high' | 'medium' | 'low' {
  switch (type) {
    case 'PENDING_APPROVAL':
      return 'critical'
    case 'REQUEST_REJECTED':
    case 'BALANCE_LOW':
      return 'high'
    case 'REQUEST_APPROVED':
    case 'DELEGATION_ASSIGNED':
      return 'medium'
    default:
      return 'low'
  }
}

function getSuggestedAction(type: string, message: string): string {
  switch (type) {
    case 'PENDING_APPROVAL':
      return 'Xem xét và phê duyệt ngay'
    case 'REQUEST_REJECTED':
      return 'Kiểm tra lý do từ chối'
    case 'BALANCE_LOW':
      return 'Lên kế hoạch nghỉ phép'
    case 'REQUEST_APPROVED':
      return 'Xác nhận thông tin'
    case 'DELEGATION_ASSIGNED':
      return 'Kiểm tra nhiệm vụ được giao'
    default:
      return 'Xem chi tiết thông báo'
  }
}

function getTrendMessage(totalUnread: number): string {
  if (totalUnread === 0) {
    return 'Hộp thư rất sạch sẽ!'
  }
  if (totalUnread > 10) {
    return 'Nhiều thông báo đang chờ xử lý. Hãy dành thời gian để xem xét.'
  }
  if (totalUnread > 5) {
    return 'Một số thông báo cần chú ý. Hãy ưu tiên các mục quan trọng.'
  }
  return 'Số lượng thông báo ở mức bình thường.'
}
