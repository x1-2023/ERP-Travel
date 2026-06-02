"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Calculator, Send, CheckCircle, FileDown, Mail, Banknote, Archive } from "lucide-react"
import { EmployeePayrollDrawer } from "@/components/payroll/employee-payroll-drawer"
import { MarkPaidModal } from "@/components/payroll/mark-paid-modal"
import { SendPayslipsModal } from "@/components/payroll/send-payslips-modal"
import { BatchCloseModal } from "@/components/reports/batch-close-modal"
import { formatCurrency } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"

interface EmployeePayrollRow {
  id: string
  baseSalary: string
  totalContractSalary: string
  actualDays: string
  standardDays: string
  totalIncome: string
  totalEmployeeIns: string
  totalEmployerIns: string
  pitAmount: string
  netSalary: string
  employee: {
    id: string
    employeeCode: string
    fullName: string
    status: string
    department: { name: string } | null
  }
  _count: { items: number }
}

interface Totals {
  totalNet: number
  totalEmployeeIns: number
  totalEmployerIns: number
  totalPIT: number
  totalIncome: number
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  PAID: { label: "Đã trả", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
}

export default function PayrollDetailPage({
  params,
}: {
  params: Promise<{ periodId: string }>
}) {
  const { periodId } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [selectedEpId, setSelectedEpId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [showMarkPaid, setShowMarkPaid] = useState(false)
  const [showSendPayslips, setShowSendPayslips] = useState(false)
  const [showBatchClose, setShowBatchClose] = useState(false)

  const isHRManager = ["SUPER_ADMIN", "HR_MANAGER"].includes(session?.user?.role || "")
  const isHRStaff = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(session?.user?.role || "")

  const { data: periodData } = useQuery({
    queryKey: ["payroll-period", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const { data: empData, isLoading } = useQuery({
    queryKey: ["payroll-employees", periodId],
    queryFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/employees`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const period = periodData?.data
  const employees: EmployeePayrollRow[] = empData?.data || []
  const totals: Totals = empData?.totals || {}
  const periodStatus = empData?.periodStatus || period?.status || "DRAFT"
  const sc = STATUS_CONFIG[periodStatus] || STATUS_CONFIG.DRAFT

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/initialize`, { method: "POST" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      setError("")
    },
    onError: (err) => { setError(err.message); toast({ title: "Lỗi", description: err.message, variant: "destructive" }) },
  })

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      setError("")
    },
    onError: (err) => { setError(err.message); toast({ title: "Lỗi", description: err.message, variant: "destructive" }) },
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/submit`, { method: "POST" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-period", periodId] })
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      setError("")
    },
    onError: (err) => { setError(err.message); toast({ title: "Lỗi", description: err.message, variant: "destructive" }) },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/payroll/${periodId}/approve`, { method: "POST" })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-period", periodId] })
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", periodId] })
      setError("")
    },
    onError: (err) => { setError(err.message); toast({ title: "Lỗi", description: err.message, variant: "destructive" }) },
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/payroll")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Danh Sách
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Bảng Lương {period ? `Tháng ${period.month}/${period.year}` : ""}
        </h1>
        <Badge className={sc.className}>{sc.label}</Badge>
      </div>

      <div className="sticky top-14 z-20 bg-background pb-2 -mx-4 md:-mx-6 px-4 md:px-6 flex items-center gap-2 mb-4 flex-wrap">
        {periodStatus === "DRAFT" && employees.length === 0 && (
          <Button
            size="sm"
            style={{ backgroundColor: "#1E3A5F" }}
            disabled={initializeMutation.isPending}
            onClick={() => initializeMutation.mutate()}
          >
            {initializeMutation.isPending ? "Đang khởi tạo..." : "Khởi Tạo Dữ Liệu"}
          </Button>
        )}
        {periodStatus === "DRAFT" && employees.length > 0 && isHRStaff && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={calculateMutation.isPending}
              onClick={() => calculateMutation.mutate()}
            >
              <Calculator className="h-4 w-4 mr-1" />
              {calculateMutation.isPending ? "Đang tính..." : "Tính Lại"}
            </Button>
            <Button
              size="sm"
              style={{ backgroundColor: "#1E3A5F" }}
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              <Send className="h-4 w-4 mr-1" />
              {submitMutation.isPending ? "Đang nộp..." : "Nộp Duyệt"}
            </Button>
          </>
        )}
        {periodStatus === "SUBMITTED" && isHRManager && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                style={{ backgroundColor: "#1E3A5F" }}
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận duyệt bảng lương?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bảng lương tháng {period?.month}/{period?.year} với {employees.length} nhân viên, tổng thực lĩnh {formatCurrency(totals.totalNet || 0)}. Sau khi duyệt, bảng lương không thể chỉnh sửa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  style={{ backgroundColor: "#1E3A5F" }}
                  onClick={() => approveMutation.mutate()}
                >
                  Xác nhận duyệt
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {(periodStatus === "APPROVED" || periodStatus === "PAID") && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/payroll/${periodId}/export`)}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Xuất File
            </Button>
            {isHRManager && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSendPayslips(true)}
              >
                <Mail className="h-4 w-4 mr-1" />
                {periodStatus === "PAID" ? "Gửi Phiếu Lương lại" : "Gửi Phiếu Lương"}
              </Button>
            )}
            {periodStatus === "APPROVED" && isHRManager && (
              <Button
                size="sm"
                style={{ backgroundColor: "#1E3A5F" }}
                onClick={() => setShowMarkPaid(true)}
              >
                <Banknote className="h-4 w-4 mr-1" />
                Đánh Dấu Đã Trả
              </Button>
            )}
          </>
        )}
        {periodStatus === "PAID" && isHRManager && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBatchClose(true)}
          >
            <Archive className="h-4 w-4 mr-1" />
            Đóng Báo Cáo
          </Button>
        )}
        {periodStatus === "PAID" && period?.paidAt && (
          <span className="text-sm text-emerald-700 font-medium">
            Đã thanh toán — {new Date(period.paidAt).toLocaleDateString("vi-VN")}
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có dữ liệu. Bấm &quot;Khởi Tạo Dữ Liệu&quot; để tự động tạo từ hợp đồng.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2 px-3">#</th>
                      <th className="text-left py-2 px-3">Mã NV</th>
                      <th className="text-left py-2 px-3">Họ tên</th>
                      <th className="text-right py-2 px-3">Lương HĐ</th>
                      <th className="text-center py-2 px-3">Công</th>
                      <th className="text-right py-2 px-3">BH NLĐ</th>
                      <th className="text-right py-2 px-3">Thuế TNCN</th>
                      <th className="text-right py-2 px-3 font-bold">Thực lĩnh</th>
                      <th className="text-right py-2 px-3 sticky right-0 bg-muted/50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((ep, i) => (
                      <tr key={ep.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 px-3">{ep.employee.employeeCode}</td>
                        <td className="py-2 px-3">
                          {ep.employee.fullName}
                          {ep.employee.status === "PROBATION" && (
                            <Badge className="ml-2 bg-blue-100 text-blue-700 text-[10px]">TV</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">{formatCurrency(Number(ep.totalContractSalary))}</td>
                        <td className="py-2 px-3 text-center">{Number(ep.actualDays)}/{Number(ep.standardDays)}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(Number(ep.totalEmployeeIns))}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(Number(ep.pitAmount))}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(Number(ep.netSalary))}</td>
                        <td className="py-2 px-3 text-right sticky right-0 bg-white">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEpId(ep.id)}
                          >
                            {periodStatus === "DRAFT" ? "Sửa" : "Xem"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="mt-4">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Tổng hợp</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground">Nhân viên</p>
                  <p className="text-lg font-bold">{employees.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tổng thu nhập</p>
                  <p className="text-lg font-bold">{formatCurrency(totals.totalIncome || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tổng thực lĩnh</p>
                  <p className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
                    {formatCurrency(totals.totalNet || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">CTY đóng BH</p>
                  <p className="text-lg font-bold">{formatCurrency(totals.totalEmployerIns || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedEpId && (
        <EmployeePayrollDrawer
          periodId={periodId}
          epId={selectedEpId}
          periodStatus={periodStatus}
          onClose={() => setSelectedEpId(null)}
        />
      )}

      {showMarkPaid && period && (
        <MarkPaidModal
          open={showMarkPaid}
          onClose={() => setShowMarkPaid(false)}
          periodId={periodId}
          month={period.month}
          year={period.year}
          totalNet={totals.totalNet || 0}
          employeeCount={employees.length}
        />
      )}

      {showSendPayslips && period && (
        <SendPayslipsModal
          open={showSendPayslips}
          onClose={() => setShowSendPayslips(false)}
          periodId={periodId}
          month={period.month}
          year={period.year}
          totalWithEmail={employees.length}
          totalWithoutEmail={0}
        />
      )}

      {showBatchClose && period && (
        <BatchCloseModal
          periodId={periodId}
          month={period.month}
          year={period.year}
          open={showBatchClose}
          onOpenChange={setShowBatchClose}
        />
      )}
    </div>
  )
}
