"use client"

import { useQuery } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, ExternalLink, KeyRound } from "lucide-react"

export default function PortalProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["portal-profile-detail"],
    queryFn: async () => {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const user = data?.data
  const emp = user?.employee

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Đang tải...</div>
    )
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Profile card */}
      <Card>
        <CardContent className="py-5 flex flex-col items-center text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            {(emp?.fullName || user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold">{emp?.fullName || user?.name}</h2>
          {emp?.employeeCode && (
            <p className="text-sm text-muted-foreground">{emp.employeeCode}</p>
          )}
          {emp?.department && (
            <p className="text-sm text-muted-foreground">{emp.department.name}</p>
          )}
          {emp?.position && (
            <p className="text-sm text-muted-foreground">{emp.position.name}</p>
          )}
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <InfoRow label="Email" value={user?.email} />
          {emp?.phone && <InfoRow label="Điện thoại" value={emp.phone} />}
          {emp?.companyEmail && <InfoRow label="Email công ty" value={emp.companyEmail} />}
          {emp?.startDate && (
            <InfoRow
              label="Ngày vào"
              value={new Date(emp.startDate).toLocaleDateString("vi-VN")}
            />
          )}
          {emp?.status && (
            <InfoRow label="Trạng thái" value={emp.status === "ACTIVE" ? "Đang làm việc" : emp.status} />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Link href="/profile" className="block">
          <Button variant="outline" className="w-full justify-start gap-2">
            <ExternalLink className="h-4 w-4" />
            Xem đầy đủ hồ sơ
          </Button>
        </Link>
        <Link href="/profile?tab=password" className="block">
          <Button variant="outline" className="w-full justify-start gap-2">
            <KeyRound className="h-4 w-4" />
            Đổi mật khẩu
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
