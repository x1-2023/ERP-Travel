// src/lib/banking/adapters/base.ts
// Base Bank Adapter

import type { BankCode, BankApiConfig } from '../types'

// ═══════════════════════════════════════════════════════════════
// BASE BANK ADAPTER
// ═══════════════════════════════════════════════════════════════

export abstract class BaseBankAdapter {
  abstract readonly bankCode: BankCode
  abstract readonly bankName: string

  protected config: BankApiConfig | null = null
  protected accessToken: string | null = null
  protected tokenExpiry: Date | null = null

  configure(config: BankApiConfig): void {
    this.config = config
  }

  protected ensureConfigured(): void {
    if (!this.config) {
      throw new Error('Bank adapter not configured. Call configure() first.')
    }
  }

  abstract authenticate(): Promise<boolean>

  // ─────────────────────────────────────────────────────────────
  // Helper methods
  // ─────────────────────────────────────────────────────────────

  protected async makeRequest<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: Record<string, unknown>
      headers?: Record<string, string>
    }
  ): Promise<T> {
    this.ensureConfigured()

    const url = `${this.config!.apiEndpoint}${endpoint}`

    const response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Bank API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  protected generateTransactionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${this.bankCode}-${timestamp}-${random}`.toUpperCase()
  }

  protected formatAmount(amount: number): string {
    return Math.round(amount).toString()
  }
}
