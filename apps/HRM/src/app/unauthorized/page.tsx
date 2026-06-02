import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: "#1E3A5F" }}>
          403
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Bạn không có quyền truy cập trang này.
        </p>
        <Link href="/">
          <Button style={{ backgroundColor: "#1E3A5F" }}>
            Quay về Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
