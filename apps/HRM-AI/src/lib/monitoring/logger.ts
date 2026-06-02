// src/lib/monitoring/logger.ts
// Structured logging utility for application monitoring

// ═══════════════════════════════════════════════════════════════
// LOG LEVELS
// ═══════════════════════════════════════════════════════════════

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
}

// ═══════════════════════════════════════════════════════════════
// LOG ENTRY TYPE
// ═══════════════════════════════════════════════════════════════

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
  requestId?: string
  userId?: string
  duration?: number
}

// ═══════════════════════════════════════════════════════════════
// LOGGER CLASS
// ═══════════════════════════════════════════════════════════════

class Logger {
  private minLevel: LogLevel

  constructor() {
    const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel
    this.minLevel = Object.values(LogLevel).includes(level) ? level : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel]
  }

  private formatEntry(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'development') {
      // Human-readable format for development
      const parts = [
        `[${entry.timestamp}]`,
        `[${entry.level.toUpperCase()}]`,
        entry.context ? `[${entry.context}]` : '',
        entry.message,
      ]

      if (entry.duration) {
        parts.push(`(${entry.duration}ms)`)
      }

      let output = parts.filter(Boolean).join(' ')

      if (entry.data) {
        output += '\n  Data: ' + JSON.stringify(entry.data, null, 2)
      }

      if (entry.error) {
        output += `\n  Error: ${entry.error.name}: ${entry.error.message}`
        if (entry.error.stack) {
          output += '\n  Stack: ' + entry.error.stack
        }
      }

      return output
    }

    // JSON format for production (structured logging)
    return JSON.stringify(entry)
  }

  private log(
    level: LogLevel,
    message: string,
    options?: {
      context?: string
      data?: Record<string, unknown>
      error?: Error
      requestId?: string
      userId?: string
      duration?: number
    }
  ): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: options?.context,
      data: options?.data,
      requestId: options?.requestId,
      userId: options?.userId,
      duration: options?.duration,
    }

    if (options?.error) {
      entry.error = {
        name: options.error.name,
        message: options.error.message,
        stack: options.error.stack,
      }
    }

    const output = this.formatEntry(entry)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(output)
        break
      case LogLevel.INFO:
        console.info(output)
        break
      case LogLevel.WARN:
        console.warn(output)
        break
      case LogLevel.ERROR:
        console.error(output)
        break
    }
  }

  debug(message: string, options?: { context?: string; data?: Record<string, unknown>; duration?: number }): void {
    this.log(LogLevel.DEBUG, message, options)
  }

  info(message: string, options?: { context?: string; data?: Record<string, unknown>; duration?: number; userId?: string; requestId?: string }): void {
    this.log(LogLevel.INFO, message, options)
  }

  warn(message: string, options?: { context?: string; data?: Record<string, unknown>; error?: Error; duration?: number }): void {
    this.log(LogLevel.WARN, message, options)
  }

  error(message: string, options?: { context?: string; data?: Record<string, unknown>; error?: Error; duration?: number }): void {
    this.log(LogLevel.ERROR, message, options)
  }

  // API request logging
  request(
    method: string,
    path: string,
    options: {
      statusCode: number
      duration: number
      userId?: string
      requestId?: string
    }
  ): void {
    const { statusCode, duration, userId, requestId } = options

    this.info(`${method} ${path} ${statusCode}`, {
      context: 'HTTP',
      data: { method, path, statusCode },
      duration,
      userId,
      requestId,
    })
  }

  // Database query logging
  query(
    operation: string,
    model: string,
    options: { duration: number; success: boolean; error?: Error }
  ): void {
    const { duration, success, error } = options

    if (success) {
      this.debug(`${operation} on ${model}`, {
        context: 'DB',
        data: { operation, model },
        duration,
      })
    } else {
      this.error(`${operation} on ${model} failed`, {
        context: 'DB',
        data: { operation, model },
        duration,
        error,
      })
    }
  }
}

// Singleton instance
export const logger = new Logger()
