import Link from "next/link"
import { FileX, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileX className="w-8 h-8 text-zinc-500" />
          </div>

          <h1 className="text-5xl font-bold text-amber-500 mb-2">404</h1>

          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Không tìm thấy trang
          </h2>

          <p className="text-zinc-400 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              asChild
              className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Link>
            </Button>
            <Button
              asChild
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
