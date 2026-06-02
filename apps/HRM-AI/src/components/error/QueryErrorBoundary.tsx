'use client'

import { ReactNode } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
    children: ReactNode
    /** Variant for different layouts */
    variant?: 'card' | 'inline' | 'full'
    /** Show retry button */
    showRetry?: boolean
    /** Custom className */
    className?: string
}

/**
 * Detect error type and return appropriate message
 */
function getErrorInfo(error: Error): {
    icon: typeof AlertCircle
    title: string
    message: string
    variant: 'network' | 'server' | 'generic'
} {
    const errorMessage = error.message.toLowerCase()

    // Network errors
    if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('failed to fetch') ||
        error.name === 'TypeError'
    ) {
        return {
            icon: WifiOff,
            title: 'Lỗi kết nối',
            message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
            variant: 'network',
        }
    }

    // Server errors (5xx)
    if (
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('server error')
    ) {
        return {
            icon: ServerCrash,
            title: 'Lỗi máy chủ',
            message: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
            variant: 'server',
        }
    }

    // Generic errors
    return {
        icon: AlertCircle,
        title: 'Đã xảy ra lỗi',
        message: error.message || 'Không thể tải dữ liệu. Vui lòng thử lại.',
        variant: 'generic',
    }
}

/**
 * Error fallback component for React Query errors
 */
function QueryErrorFallback({
    error,
    resetErrorBoundary,
    variant = 'card',
    showRetry = true,
}: {
    error: Error
    resetErrorBoundary: () => void
    variant?: Props['variant']
    showRetry?: boolean
}) {
    const errorInfo = getErrorInfo(error)
    const Icon = errorInfo.icon

    const iconColor = {
        network: 'text-yellow-500',
        server: 'text-red-500',
        generic: 'text-orange-500',
    }[errorInfo.variant]

    const bgColor = {
        network: 'bg-yellow-500/10',
        server: 'bg-red-500/10',
        generic: 'bg-orange-500/10',
    }[errorInfo.variant]

    if (variant === 'inline') {
        return (
            <div className={cn('flex items-center gap-3 text-sm py-2', bgColor, 'px-3 rounded-lg')}>
                <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
                <span className="text-zinc-400">{errorInfo.message}</span>
                {showRetry && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetErrorBoundary}
                        className="ml-auto h-7 px-2 text-zinc-400 hover:text-zinc-200"
                    >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Thử lại
                    </Button>
                )}
            </div>
        )
    }

    if (variant === 'full') {
        return (
            <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-center p-6">
                    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4', bgColor)}>
                        <Icon className={cn('w-7 h-7', iconColor)} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">{errorInfo.title}</h3>
                    <p className="text-zinc-400 mb-4 max-w-xs mx-auto">{errorInfo.message}</p>
                    {showRetry && (
                        <Button
                            variant="outline"
                            onClick={resetErrorBoundary}
                            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Thử lại
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // Default: card variant
    return (
        <div className={cn('bg-zinc-900/50 border border-zinc-800 rounded-lg p-4')}>
            <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg flex-shrink-0', bgColor)}>
                    <Icon className={cn('w-5 h-5', iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-200">{errorInfo.title}</h4>
                    <p className="text-sm text-zinc-400 mt-1">{errorInfo.message}</p>
                    {showRetry && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetErrorBoundary}
                            className="mt-3 h-8 px-3 text-zinc-400 hover:text-zinc-200 -ml-3"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Thử lại
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * Query Error Boundary for React Query with automatic retry support
 * 
 * @example
 * ```tsx
 * <QueryErrorBoundary>
 *   <EmployeeList /> // Uses useQuery internally
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({
    children,
    variant = 'card',
    showRetry = true,
    className,
}: Props) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ReactErrorBoundary
                    fallbackRender={(props: FallbackProps) => (
                        <div className={className}>
                            <QueryErrorFallback
                                error={props.error instanceof Error ? props.error : new Error(String(props.error))}
                                resetErrorBoundary={() => {
                                    reset()
                                    props.resetErrorBoundary()
                                }}
                                variant={variant}
                                showRetry={showRetry}
                            />
                        </div>
                    )}
                    onReset={reset}
                >
                    {children}
                </ReactErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    )
}

export default QueryErrorBoundary
