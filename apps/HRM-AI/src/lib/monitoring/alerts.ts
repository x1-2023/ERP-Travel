// src/lib/monitoring/alerts.ts
// Alert Manager with Webhook Integration

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  message: string
  source: string
  timestamp: Date
  metadata?: Record<string, unknown>
  acknowledged?: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
}

export interface AlertFilter {
  severity?: AlertSeverity
  acknowledged?: boolean
  source?: string
  fromDate?: Date
  toDate?: Date
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// ALERT MANAGER
// ═══════════════════════════════════════════════════════════════

class AlertManager {
  private alerts: Alert[] = []
  private webhookUrl?: string
  private emailRecipients: string[] = []
  private maxAlerts = 1000 // Keep last 1000 alerts in memory

  constructor() {
    this.webhookUrl = process.env.ALERT_WEBHOOK_URL
    this.emailRecipients = (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean)
  }

  // ─────────────────────────────────────────────────────────────
  // Send Alert
  // ─────────────────────────────────────────────────────────────

  async sendAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Promise<Alert> {
    const fullAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      acknowledged: false,
    }

    // Add to memory
    this.alerts.unshift(fullAlert)

    // Trim old alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    // Log alert
    const logLevel = ['CRITICAL', 'ERROR'].includes(alert.severity) ? 'error' : alert.severity === 'WARNING' ? 'warn' : 'info'

    console[logLevel](`[ALERT] ${alert.severity}: ${alert.title}`, {
      alert: fullAlert,
    })

    // Send to webhook (Slack, Teams, etc.)
    if (this.webhookUrl && ['CRITICAL', 'ERROR'].includes(alert.severity)) {
      await this.sendWebhook(fullAlert)
    }

    // Send email for critical alerts
    if (alert.severity === 'CRITICAL' && this.emailRecipients.length > 0) {
      await this.sendEmail(fullAlert)
    }

    return fullAlert
  }

  // ─────────────────────────────────────────────────────────────
  // Webhook Integration
  // ─────────────────────────────────────────────────────────────

  private async sendWebhook(alert: Alert): Promise<void> {
    if (!this.webhookUrl) return

    try {
      // Detect webhook type from URL
      const isSlack = this.webhookUrl.includes('slack.com')
      const isTeams = this.webhookUrl.includes('webhook.office.com')
      const isDiscord = this.webhookUrl.includes('discord.com')

      let payload: Record<string, unknown>

      if (isSlack) {
        payload = this.formatSlackPayload(alert)
      } else if (isTeams) {
        payload = this.formatTeamsPayload(alert)
      } else if (isDiscord) {
        payload = this.formatDiscordPayload(alert)
      } else {
        // Generic webhook
        payload = {
          alert: {
            id: alert.id,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            source: alert.source,
            timestamp: alert.timestamp.toISOString(),
            metadata: alert.metadata,
          },
        }
      }

      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

    } catch (error) {
      console.error('Failed to send webhook alert', {
        alertId: alert.id,
        error: (error as Error).message,
      })
    }
  }

  private formatSlackPayload(alert: Alert): Record<string, unknown> {
    const severityEmoji = {
      INFO: 'ℹ️',
      WARNING: '⚠️',
      ERROR: '❌',
      CRITICAL: '🚨',
    }

    const severityColor = {
      INFO: '#2196F3',
      WARNING: '#FF9800',
      ERROR: '#F44336',
      CRITICAL: '#9C27B0',
    }

    return {
      text: `${severityEmoji[alert.severity]} *${alert.severity}*: ${alert.title}`,
      attachments: [
        {
          color: severityColor[alert.severity],
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: alert.message,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Source: *${alert.source}* | Time: ${alert.timestamp.toISOString()}`,
                },
              ],
            },
          ],
        },
      ],
    }
  }

  private formatTeamsPayload(alert: Alert): Record<string, unknown> {
    const severityColor = {
      INFO: '0078D4',
      WARNING: 'FFC107',
      ERROR: 'DC3545',
      CRITICAL: '6F42C1',
    }

    return {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: severityColor[alert.severity],
      summary: `${alert.severity}: ${alert.title}`,
      sections: [
        {
          activityTitle: `${alert.severity}: ${alert.title}`,
          facts: [
            { name: 'Source', value: alert.source },
            { name: 'Time', value: alert.timestamp.toISOString() },
          ],
          text: alert.message,
        },
      ],
    }
  }

  private formatDiscordPayload(alert: Alert): Record<string, unknown> {
    const severityColor = {
      INFO: 0x2196f3,
      WARNING: 0xff9800,
      ERROR: 0xf44336,
      CRITICAL: 0x9c27b0,
    }

    return {
      embeds: [
        {
          title: `${alert.severity}: ${alert.title}`,
          description: alert.message,
          color: severityColor[alert.severity],
          fields: [
            { name: 'Source', value: alert.source, inline: true },
            { name: 'Time', value: alert.timestamp.toISOString(), inline: true },
          ],
        },
      ],
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Email Notification
  // ─────────────────────────────────────────────────────────────

  private async sendEmail(alert: Alert): Promise<void> {
    // TODO: Implement email sending via your email service
  }

  // ─────────────────────────────────────────────────────────────
  // Query Alerts
  // ─────────────────────────────────────────────────────────────

  getAlerts(filter?: AlertFilter): Alert[] {
    let filtered = [...this.alerts]

    if (filter?.severity) {
      filtered = filtered.filter((a) => a.severity === filter.severity)
    }
    if (filter?.acknowledged !== undefined) {
      filtered = filtered.filter((a) => a.acknowledged === filter.acknowledged)
    }
    if (filter?.source) {
      filtered = filtered.filter((a) => a.source === filter.source)
    }
    if (filter?.fromDate) {
      filtered = filtered.filter((a) => a.timestamp >= filter.fromDate!)
    }
    if (filter?.toDate) {
      filtered = filtered.filter((a) => a.timestamp <= filter.toDate!)
    }

    // Already sorted by timestamp (newest first)
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit)
    }

    return filtered
  }

  getAlert(alertId: string): Alert | undefined {
    return this.alerts.find((a) => a.id === alertId)
  }

  // ─────────────────────────────────────────────────────────────
  // Acknowledge Alert
  // ─────────────────────────────────────────────────────────────

  acknowledgeAlert(alertId: string, userId?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date()
      alert.acknowledgedBy = userId
      return true
    }
    return false
  }

  acknowledgeAll(filter?: AlertFilter): number {
    const alerts = this.getAlerts({ ...filter, acknowledged: false })
    let count = 0
    for (const alert of alerts) {
      if (this.acknowledgeAlert(alert.id)) {
        count++
      }
    }
    return count
  }

  // ─────────────────────────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────────────────────────

  getStats(): {
    total: number
    bySeverity: Record<AlertSeverity, number>
    unacknowledged: number
    last24h: number
  } {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return {
      total: this.alerts.length,
      bySeverity: {
        INFO: this.alerts.filter((a) => a.severity === 'INFO').length,
        WARNING: this.alerts.filter((a) => a.severity === 'WARNING').length,
        ERROR: this.alerts.filter((a) => a.severity === 'ERROR').length,
        CRITICAL: this.alerts.filter((a) => a.severity === 'CRITICAL').length,
      },
      unacknowledged: this.alerts.filter((a) => !a.acknowledged).length,
      last24h: this.alerts.filter((a) => a.timestamp >= dayAgo).length,
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const alertManager = new AlertManager()

// ═══════════════════════════════════════════════════════════════
// PREDEFINED ALERTS
// ═══════════════════════════════════════════════════════════════

export const alerts = {
  // Payment Alerts
  paymentFailed: (batchId: string, error: string) =>
    alertManager.sendAlert({
      severity: 'ERROR',
      title: 'Payment Batch Failed',
      message: `Batch ${batchId} failed: ${error}`,
      source: 'banking',
      metadata: { batchId },
    }),

  paymentPartialSuccess: (batchId: string, successCount: number, failedCount: number) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'Payment Batch Partial Success',
      message: `Batch ${batchId}: ${successCount} succeeded, ${failedCount} failed`,
      source: 'banking',
      metadata: { batchId, successCount, failedCount },
    }),

  // System Alerts
  highErrorRate: (errorRate: number, endpoint: string) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'High Error Rate Detected',
      message: `Error rate ${errorRate.toFixed(1)}% on ${endpoint}`,
      source: 'monitoring',
      metadata: { errorRate, endpoint },
    }),

  systemHealthDegraded: (component: string, status: string) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'System Health Degraded',
      message: `${component} is ${status}`,
      source: 'health',
      metadata: { component, status },
    }),

  databaseSlowQuery: (query: string, duration: number) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'Slow Database Query',
      message: `Query took ${duration}ms: ${query.substring(0, 100)}...`,
      source: 'database',
      metadata: { query, duration },
    }),

  // Security Alerts
  securityIncident: (type: string, details: string) =>
    alertManager.sendAlert({
      severity: 'CRITICAL',
      title: 'Security Incident',
      message: `${type}: ${details}`,
      source: 'security',
      metadata: { type },
    }),

  suspiciousActivity: (userId: string, activity: string) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'Suspicious Activity',
      message: `User ${userId}: ${activity}`,
      source: 'security',
      metadata: { userId, activity },
    }),

  loginFailures: (userId: string, count: number) =>
    alertManager.sendAlert({
      severity: count >= 10 ? 'ERROR' : 'WARNING',
      title: 'Multiple Login Failures',
      message: `User ${userId} has ${count} failed login attempts`,
      source: 'security',
      metadata: { userId, count },
    }),

  // Integration Alerts
  externalApiDown: (service: string, error: string) =>
    alertManager.sendAlert({
      severity: 'ERROR',
      title: 'External API Down',
      message: `${service} is unavailable: ${error}`,
      source: 'integrations',
      metadata: { service },
    }),

  certificateExpiring: (service: string, daysUntilExpiry: number) =>
    alertManager.sendAlert({
      severity: daysUntilExpiry <= 7 ? 'CRITICAL' : 'WARNING',
      title: 'Certificate Expiring Soon',
      message: `${service} certificate expires in ${daysUntilExpiry} days`,
      source: 'security',
      metadata: { service, daysUntilExpiry },
    }),

  // Business Alerts
  complianceDeadline: (reportType: string, deadline: Date) =>
    alertManager.sendAlert({
      severity: 'WARNING',
      title: 'Compliance Deadline Approaching',
      message: `${reportType} due on ${deadline.toLocaleDateString('vi-VN')}`,
      source: 'compliance',
      metadata: { reportType, deadline: deadline.toISOString() },
    }),

  payrollProcessingComplete: (periodId: string, employeeCount: number, totalAmount: number) =>
    alertManager.sendAlert({
      severity: 'INFO',
      title: 'Payroll Processing Complete',
      message: `Processed payroll for ${employeeCount} employees, total: ${totalAmount.toLocaleString()} VND`,
      source: 'payroll',
      metadata: { periodId, employeeCount, totalAmount },
    }),
}
