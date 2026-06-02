'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Building2, Phone, Mail, CreditCard, Calendar, User } from 'lucide-react'
import { useEmployee } from '@/hooks/use-employees'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_COLORS } from '@/lib/constants'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2">
      <span className="text-sm text-muted-foreground sm:w-48 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleDateString('vi-VN')
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: employee, isLoading, error } = useEmployee(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <PageHeader title="Không tìm thấy nhân viên" description="Nhân viên không tồn tại hoặc đã bị xóa">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </PageHeader>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.fullName}
        description={`Mã NV: ${employee.employeeCode}`}
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Link href={`/employees/${id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center gap-3 mb-2">
        <Badge className={EMPLOYEE_STATUS_COLORS[employee.status]} variant="secondary">
          {EMPLOYEE_STATUS_LABELS[employee.status] || employee.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Họ và tên" value={employee.fullName} />
            <InfoRow label="Ngày sinh" value={formatDate(employee.dateOfBirth)} />
            <InfoRow label="Giới tính" value={employee.gender === 'MALE' ? 'Nam' : employee.gender === 'FEMALE' ? 'Nữ' : employee.gender} />
            <InfoRow label="CCCD/CMND" value={employee.idNumber} />
            <InfoRow label="Ngày cấp" value={formatDate(employee.idIssueDate)} />
            <InfoRow label="Nơi cấp" value={employee.idIssuePlace} />
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Điện thoại" value={employee.phone} />
            <InfoRow label="Email cá nhân" value={employee.personalEmail} />
            <InfoRow label="Email công việc" value={employee.workEmail} />
            <InfoRow label="Địa chỉ thường trú" value={employee.permanentAddress} />
            <InfoRow label="Địa chỉ hiện tại" value={employee.currentAddress} />
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Tổ chức
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Phòng ban" value={employee.department?.name} />
            <InfoRow label="Chức danh" value={employee.position?.name} />
            <InfoRow label="Chi nhánh" value={employee.branch?.name} />
            <InfoRow label="Quản lý trực tiếp" value={employee.directManager?.fullName} />
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Công việc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Ngày vào làm" value={formatDate(employee.hireDate)} />
            <InfoRow label="Hết thử việc" value={formatDate(employee.probationEndDate)} />
            <InfoRow label="Ngày nghỉ việc" value={formatDate(employee.resignationDate)} />
            <InfoRow label="Lý do nghỉ" value={employee.resignationReason} />
          </CardContent>
        </Card>

        {/* Tax & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Thuế & Bảo hiểm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Mã số thuế" value={employee.taxCode} />
            <InfoRow label="Số sổ BHXH" value={employee.socialInsuranceNumber} />
            <InfoRow label="Ngày tham gia BHXH" value={formatDate(employee.socialInsuranceDate)} />
          </CardContent>
        </Card>

        {/* Bank */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Ngân hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Số tài khoản" value={employee.bankAccount} />
            <InfoRow label="Ngân hàng" value={employee.bankName} />
            <InfoRow label="Chi nhánh NH" value={employee.bankBranch} />
          </CardContent>
        </Card>
      </div>

      {/* Contracts */}
      {employee.contracts && employee.contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hợp đồng lao động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.contracts.map((contract: Record<string, unknown>) => (
                <div key={contract.id as string} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{contract.contractNumber as string || contract.contractType as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(contract.startDate as string)} - {formatDate(contract.endDate as string) || 'Không thời hạn'}
                    </p>
                  </div>
                  <Badge variant="secondary">{contract.contractType as string}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependents */}
      {employee.dependents && employee.dependents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Người phụ thuộc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.dependents.map((dep: Record<string, unknown>) => (
                <div key={dep.id as string} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{dep.fullName as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {dep.relationship as string} {dep.dateOfBirth ? `• ${formatDate(dep.dateOfBirth as string)}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
