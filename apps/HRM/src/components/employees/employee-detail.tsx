"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Pencil, CheckCircle2, XCircle } from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import { OnboardingTab } from "./onboarding-tab"
import { HREventsTab } from "./hr-events-tab"
import { ContractTab } from "./contract-tab"
import { OffboardingTab } from "./offboarding-tab"
import { DependentTab } from "./dependent-tab"

interface ChangeRecord {
  id: string
  fieldName: string
  oldValue: string | null
  newValue: string | null
  changedBy: string
  reason: string | null
  createdAt: string
}

interface HrDocs {
  cccd?: boolean
  degree?: boolean
  cv?: boolean
  healthCheck?: boolean
  photo?: boolean
  other?: string
}

interface EmployeeDetailData {
  id: string
  employeeCode: string
  fullName: string
  nameNoAccent: string
  gender: string
  dateOfBirth: string | null
  permanentAddress: string | null
  currentAddress: string | null
  phone: string | null
  nationalId: string | null
  nationalIdDate: string | null
  nationalIdPlace: string | null
  status: string
  startDate: string | null
  resignDate: string | null
  jobDescription: string | null
  bankAccount: string | null
  bankBranch: string | null
  taxCode: string | null
  taxCodeOld: string | null
  insuranceCode: string | null
  companyEmail: string | null
  personalEmail: string | null
  vehiclePlate: string | null
  school: string | null
  major: string | null
  hrDocsSubmitted: HrDocs | null
  department: { id: string; name: string; code: string } | null
  position: { id: string; name: string; code: string } | null
  teamManager: { id: string; fullName: string; employeeCode: string } | null
  changeHistory: ChangeRecord[]
}

interface EmployeeDetailProps {
  employee: EmployeeDetailData
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang làm", className: "bg-green-500" },
  PROBATION: { label: "Thử việc", className: "bg-blue-500" },
  ON_LEAVE: { label: "Nghỉ phép", className: "bg-yellow-500 text-black" },
  RESIGNED: { label: "Đã nghỉ", className: "bg-red-500" },
  TERMINATED: { label: "Chấm dứt", className: "bg-red-700" },
  SUSPENDED: { label: "Đình chỉ", className: "bg-orange-500" },
}

const GENDER_MAP: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-1.5">
      <span className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}:</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

const FIELD_LABELS: Record<string, string> = {
  fullName: "Họ tên",
  gender: "Giới tính",
  dateOfBirth: "Ngày sinh",
  phone: "SĐT",
  departmentId: "Phòng ban",
  positionId: "Chức vụ",
  status: "Trạng thái",
  startDate: "Ngày vào",
  bankAccount: "STK",
  companyEmail: "Email cty",
  nationalId: "CCCD",
  teamManagerId: "Quản lý",
}

export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isEmployee = session?.user?.role === "EMPLOYEE"
  const statusCfg = STATUS_CONFIG[employee.status] || STATUS_CONFIG.ACTIVE
  const docs = (employee.hrDocsSubmitted as HrDocs) || {}

  function maskBankAccount(acc: string | null): string {
    if (!acc) return "—"
    if (isEmployee && acc.length > 4) {
      return "****" + acc.slice(-4)
    }
    return acc
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/employees")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Danh Sách
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
            {employee.fullName}
          </h1>
          <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
        </div>
        {!isEmployee && (
          <Button
            onClick={() => router.push(`/employees/${employee.id}/edit`)}
            className="gap-2"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            <Pencil className="h-4 w-4" />
            Chỉnh Sửa
          </Button>
        )}
      </div>

      {/* Sub-header */}
      <p className="text-muted-foreground mb-6">
        {employee.employeeCode}
        {employee.department && ` · ${employee.department.name}`}
        {employee.position && ` · ${employee.position.name}`}
        {employee.startDate && ` · Vào: ${formatDate(employee.startDate)}`}
      </p>

      <Tabs defaultValue="info" className="mt-2">
        <TabsList>
          <TabsTrigger value="info">Thông tin</TabsTrigger>
          {!isEmployee && <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="onboarding">Onboarding</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="hr-events">Biến động</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="dependents">NPT</TabsTrigger>}
          {!isEmployee && <TabsTrigger value="offboarding">Offboarding</TabsTrigger>}
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông Tin Cá Nhân</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Giới tính" value={GENDER_MAP[employee.gender]} />
                  <InfoRow label="Ngày sinh" value={formatDate(employee.dateOfBirth)} />
                  <InfoRow label="CCCD" value={employee.nationalId} />
                  <InfoRow label="Ngày cấp" value={formatDate(employee.nationalIdDate)} />
                  <InfoRow label="Nơi cấp" value={employee.nationalIdPlace} />
                  <InfoRow label="SĐT" value={employee.phone} />
                  <InfoRow label="Địa chỉ TT" value={employee.permanentAddress} />
                  <InfoRow label="Địa chỉ HT" value={employee.currentAddress} />
                  <InfoRow label="Biển số xe" value={employee.vehiclePlate} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Học Vấn</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Trường" value={employee.school} />
                  <InfoRow label="Ngành" value={employee.major} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Email công ty" value={employee.companyEmail} />
                  <InfoRow label="Email cá nhân" value={employee.personalEmail} />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông Tin Công Việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Phòng" value={employee.department?.name} />
                  <InfoRow label="Chức vụ" value={employee.position?.name} />
                  <InfoRow
                    label="QL trực tiếp"
                    value={employee.teamManager ? `${employee.teamManager.fullName} (${employee.teamManager.employeeCode})` : null}
                  />
                  <InfoRow label="Ngày vào" value={formatDate(employee.startDate)} />
                  {employee.resignDate && (
                    <InfoRow label="Ngày nghỉ" value={formatDate(employee.resignDate)} />
                  )}
                  <InfoRow label="Mô tả CV" value={employee.jobDescription} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tài Chính</CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="STK" value={maskBankAccount(employee.bankAccount)} />
                  <InfoRow label="Ngân hàng" value={employee.bankBranch} />
                  <InfoRow label="Tên TK" value={employee.nameNoAccent} />
                  <InfoRow label="MST" value={employee.taxCode} />
                  {employee.taxCodeOld && <InfoRow label="MST cũ" value={employee.taxCodeOld} />}
                  <InfoRow label="Mã BH" value={employee.insuranceCode} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hồ Sơ Đã Nộp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "cccd", label: "CCCD" },
                      { key: "degree", label: "Bằng cấp" },
                      { key: "cv", label: "Lý lịch" },
                      { key: "healthCheck", label: "KSK" },
                      { key: "photo", label: "Ảnh" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        {docs[key as keyof HrDocs] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                  {docs.other && (
                    <p className="text-sm text-muted-foreground mt-2">Ghi chú: {docs.other}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Change History */}
          {employee.changeHistory.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Lịch Sử Thay Đổi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employee.changeHistory.map((ch) => (
                    <div key={ch.id} className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                        {formatDate(ch.createdAt)}
                      </span>
                      <Separator orientation="vertical" className="h-auto" />
                      <p className="text-sm">
                        <span className="font-medium">{FIELD_LABELS[ch.fieldName] || ch.fieldName}</span>
                        {ch.oldValue ? (
                          <>: {ch.oldValue} → {ch.newValue}</>
                        ) : (
                          <>: {ch.newValue} (tạo mới)</>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {!isEmployee && (
          <TabsContent value="contracts" className="mt-4">
            <ContractTab employeeId={employee.id} />
          </TabsContent>
        )}

        {!isEmployee && (
          <TabsContent value="onboarding" className="mt-4">
            <OnboardingTab employeeId={employee.id} />
          </TabsContent>
        )}

        {!isEmployee && (
          <TabsContent value="hr-events" className="mt-4">
            <HREventsTab employeeId={employee.id} />
          </TabsContent>
        )}

        {!isEmployee && (
          <TabsContent value="dependents" className="mt-4">
            <DependentTab employeeId={employee.id} />
          </TabsContent>
        )}

        {!isEmployee && (
          <TabsContent value="offboarding" className="mt-4">
            <OffboardingTab employeeId={employee.id} employeeStatus={employee.status} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
