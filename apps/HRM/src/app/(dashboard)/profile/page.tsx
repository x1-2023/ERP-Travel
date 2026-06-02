"use client"

import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { PayslipList } from "@/components/profile/payslip-list"
import { MyReviews } from "@/components/profile/my-reviews"
import { User, Wallet, Star } from "lucide-react"

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
  }

  const user = data?.data
  const employee = user?.employee

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
        Hồ Sơ Cá Nhân
      </h1>

      <Tabs defaultValue="info" className="mt-2">
        <TabsList>
          <TabsTrigger value="info" className="gap-1.5">
            <User className="h-4 w-4" />
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="payslips" className="gap-1.5">
            <Wallet className="h-4 w-4" />
            Phiếu Lương
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <Star className="h-4 w-4" />
            Đánh Giá
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-6">
          {employee ? (
            <>
              <ProfileForm employee={employee} />
              <ChangePasswordForm />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tài khoản chưa liên kết với hồ sơ nhân viên
              <ChangePasswordForm />
            </div>
          )}
        </TabsContent>

        <TabsContent value="payslips" className="mt-4">
          {employee ? (
            <PayslipList />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tài khoản chưa liên kết với hồ sơ nhân viên
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {employee ? (
            <MyReviews employeeId={employee.id} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tài khoản chưa liên kết với hồ sơ nhân viên
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
