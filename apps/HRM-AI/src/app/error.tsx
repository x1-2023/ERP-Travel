'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Đã xảy ra lỗi
          </h2>

          <p className="text-zinc-400 mb-6">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Chi tiết lỗi (Dev only)</span>
              </div>
              <p className="text-sm text-red-400 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-zinc-500">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={reset}
              className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
