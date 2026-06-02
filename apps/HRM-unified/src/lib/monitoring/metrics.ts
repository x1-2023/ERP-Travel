// src/lib/monitoring/metrics.ts
// Application metrics collection

// ═══════════════════════════════════════════════════════════════
// METRIC TYPES
// ═══════════════════════════════════════════════════════════════

interface CounterMetric {
  type: 'counter'
  value: number
  labels: Record<string, string>
}

interface GaugeMetric {
  type: 'gauge'
  value: number
  labels: Record<string, string>
}

interface HistogramMetric {
  type: 'histogram'
  values: number[]
  labels: Record<string, string>
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric

// ═══════════════════════════════════════════════════════════════
// METRICS COLLECTOR
// ═══════════════════════════════════════════════════════════════

class MetricsCollector {
  private counters = new Map<string, CounterMetric>()
  private gauges = new Map<string, GaugeMetric>()
  private histograms = new Map<string, HistogramMetric>()

  private getKey(name: string, labels: Record<string, string> = {}): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return labelStr ? `${name}{${labelStr}}` : name
  }

  // ─────────────────────────────────────────────────────────────
  // Counter methods
  // ─────────────────────────────────────────────────────────────

  increment(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const key = this.getKey(name, labels)
    const existing = this.counters.get(key)

    if (existing) {
      existing.value += value
    } else {
      this.counters.set(key, {
        type: 'counter',
        value,
        labels,
      })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Gauge methods
  // ─────────────────────────────────────────────────────────────

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels)
    this.gauges.set(key, {
      type: 'gauge',
      value,
      labels,
    })
  }

  // ─────────────────────────────────────────────────────────────
  // Histogram methods
  // ─────────────────────────────────────────────────────────────

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels)
    const existing = this.histograms.get(key)

    if (existing) {
      existing.values.push(value)
      // Keep only last 1000 values to prevent memory issues
      if (existing.values.length > 1000) {
        existing.values = existing.values.slice(-1000)
      }
    } else {
      this.histograms.set(key, {
        type: 'histogram',
        values: [value],
        labels,
      })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Timing helper
  // ─────────────────────────────────────────────────────────────

  startTimer(): () => number {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      return duration
    }
  }

  async time<T>(
    name: string,
    fn: () => Promise<T>,
    labels: Record<string, string> = {}
  ): Promise<T> {
    const stopTimer = this.startTimer()
    try {
      const result = await fn()
      this.observe(name, stopTimer(), { ...labels, status: 'success' })
      return result
    } catch (error) {
      this.observe(name, stopTimer(), { ...labels, status: 'error' })
      throw error
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Export metrics
  // ─────────────────────────────────────────────────────────────

  getAll(): Record<string, Metric> {
    const all: Record<string, Metric> = {}

    const counterEntries = Array.from(this.counters.entries())
    for (const [key, value] of counterEntries) {
      all[key] = value
    }
    const gaugeEntries = Array.from(this.gauges.entries())
    for (const [key, value] of gaugeEntries) {
      all[key] = value
    }
    const histogramEntries = Array.from(this.histograms.entries())
    for (const [key, value] of histogramEntries) {
      all[key] = value
    }

    return all
  }

  // Get histogram statistics
  getHistogramStats(name: string, labels: Record<string, string> = {}): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const key = this.getKey(name, labels)
    const histogram = this.histograms.get(key)

    if (!histogram || histogram.values.length === 0) {
      return null
    }

    const sorted = [...histogram.values].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * count) - 1
      return sorted[Math.max(0, index)]
    }

    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    }
  }

  // Reset all metrics
  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }
}

// Singleton instance
export const metrics = new MetricsCollector()

// ═══════════════════════════════════════════════════════════════
// PREDEFINED METRICS
// ═══════════════════════════════════════════════════════════════

export const MetricNames = {
  // HTTP metrics
  HTTP_REQUESTS_TOTAL: 'http_requests_total',
  HTTP_REQUEST_DURATION_MS: 'http_request_duration_ms',
  HTTP_ERRORS_TOTAL: 'http_errors_total',

  // Database metrics
  DB_QUERIES_TOTAL: 'db_queries_total',
  DB_QUERY_DURATION_MS: 'db_query_duration_ms',
  DB_CONNECTIONS_ACTIVE: 'db_connections_active',

  // Cache metrics
  CACHE_HITS_TOTAL: 'cache_hits_total',
  CACHE_MISSES_TOTAL: 'cache_misses_total',

  // Business metrics
  EMPLOYEES_TOTAL: 'employees_total',
  ACTIVE_SESSIONS: 'active_sessions',
  AI_REQUESTS_TOTAL: 'ai_requests_total',
  AI_REQUEST_DURATION_MS: 'ai_request_duration_ms',
} as const
