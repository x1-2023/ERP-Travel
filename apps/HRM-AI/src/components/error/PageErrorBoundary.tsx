'use client'

import { Component, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

/**
 * Props for PageErrorBoundary
 */
interface Props {
    children: ReactNode
    /** Custom fallback UI */
    fallback?: ReactNode
    /** Page name for context */
    pageName?: string
    /** Whether to show back button */
    showBackButton?: boolean
    /** Custom error handler */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

/**
 * Error details panel for development
 */
function ErrorDetails({ error, errorInfo }: { error: Error; errorInfo?: React.ErrorInfo }) {
    const [copied, setCopied] = useState(false)

    const errorText = `${error.name}: ${error.message}\n\n${error.stack || ''}\n\nComponent Stack:${errorInfo?.componentStack || ''}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(errorText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mt-6 text-left">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Chi tiết lỗi (Dev only)</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span className="ml-1 text-xs">{copied ? 'Đã copy' : 'Copy'}</span>
                </Button>
            </div>

            <div className="space-y-2">
                <div>
                    <span className="text-xs text-zinc-500">Error:</span>
                    <p className="text-sm text-red-400 font-mono break-all">{error.message}</p>
                </div>

                {error.stack && (
                    <div>
                        <span className="text-xs text-zinc-500">Stack trace:</span>
                        <pre className="mt-1 text-xs text-zinc-500 overflow-auto max-h-40 bg-zinc-900/50 p-2 rounded">
                            {error.stack}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Page-level Error Boundary with enhanced UI and navigation options
 * 
 * @example
 * ```tsx
 * <PageErrorBoundary pageName="Danh sách nhân viên" showBackButton>
 *   <EmployeeList />
 * </PageErrorBoundary>
 * ```
 */
export class PageErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('PageErrorBoundary caught error:', error)
            console.error('Error info:', errorInfo)
        }

        // Call custom error handler
        this.props.onError?.(error, errorInfo)

        // TODO: Send to Sentry
        // captureException(error, { extra: { componentStack: errorInfo.componentStack } })

        this.setState({ errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <PageErrorFallback
                    error={this.state.error!}
                    errorInfo={this.state.errorInfo}
                    pageName={this.props.pageName}
                    showBackButton={this.props.showBackButton}
                    onReset={this.handleReset}
                />
            )
        }

        return this.props.children
    }
}

/**
 * Fallback UI component (can be used standalone)
 */
function PageErrorFallback({
    error,
    errorInfo,
    pageName,
    showBackButton = true,
    onReset,
}: {
    error: Error
    errorInfo?: React.ErrorInfo
    pageName?: string
    showBackButton?: boolean
    onReset: () => void
}) {
    // Note: Using hooks inside class component's render via separate functional component
    const handleBack = () => {
        window.history.back()
    }

    const handleHome = () => {
        window.location.href = '/dashboard'
    }

    return (
        <div className="min-h-[400px] bg-zinc-950/50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
                <div className="text-center">
                    {/* Error Icon */}
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                        Đã xảy ra lỗi
                    </h2>

                    {/* Page context */}
                    {pageName && (
                        <p className="text-sm text-zinc-500 mb-2">
                            Tại trang: <span className="text-zinc-400">{pageName}</span>
                        </p>
                    )}

                    {/* Description */}
                    <p className="text-zinc-400 mb-6">
                        Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-center flex-wrap">
                        {showBackButton && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={onReset}
                            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Thử lại
                        </Button>

                        <Button
                            onClick={handleHome}
                            className="gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                        >
                            <Home className="w-4 h-4" />
                            Trang chủ
                        </Button>
                    </div>

                    {/* Dev-only error details */}
                    {process.env.NODE_ENV === 'development' && error && (
                        <ErrorDetails error={error} errorInfo={errorInfo} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default PageErrorBoundary
