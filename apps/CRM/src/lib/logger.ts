// Structured JSON logger — no external dependencies
// Outputs JSON to console for easy parsing by log aggregators

type LogLevel = 'info' | 'warn' | 'error' | 'audit'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  error?: string
  stack?: string
  [key: string]: unknown
}

function formatEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }
}

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    const entry = formatEntry('info', message, data)
    console.log(JSON.stringify(entry))
  },

  warn(message: string, data?: Record<string, unknown>): void {
    const entry = formatEntry('warn', message, data)
    console.warn(JSON.stringify(entry))
  },

  error(message: string, error?: Error | null, data?: Record<string, unknown>): void {
    const entry = formatEntry('error', message, {
      ...data,
      ...(error && {
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      }),
    })
    console.error(JSON.stringify(entry))
  },

  audit(action: string, userId: string, data?: Record<string, unknown>): void {
    const entry = formatEntry('audit', action, {
      userId,
      ...data,
    })
    console.log(JSON.stringify(entry))
  },
}
