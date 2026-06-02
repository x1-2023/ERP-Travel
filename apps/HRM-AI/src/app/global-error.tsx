"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="vi" className="dark">
      <body className="font-sans bg-[#0A0A0F] text-[#DDE1E8]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-lg font-semibold">Đã xảy ra lỗi nghiêm trọng</h2>
          <p className="text-sm opacity-60">
            {error.message || "Ứng dụng gặp sự cố không mong muốn."}
          </p>
          <Button onClick={reset} variant="outline" size="sm">
            Thử lại
          </Button>
        </div>
      </body>
    </html>
  )
}
