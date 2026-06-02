import { formatDate } from "@/lib/utils/format"

interface EmployeeWithRelations {
  fullName: string
  employeeCode: string
  gender: string
  dateOfBirth: Date | null
  phone: string | null
  nationalId: string | null
  currentAddress: string | null
  permanentAddress: string | null
  bankAccount: string | null
  bankBranch: string | null
  taxCode: string | null
  insuranceCode: string | null
  companyEmail: string | null
  personalEmail: string | null
  school: string | null
  major: string | null
  startDate: Date | null
  department: { name: string } | null
  position: { name: string } | null
  contracts: { baseSalary: unknown }[]
}

function formatCurrency(val: unknown): string {
  if (!val) return ""
  const n = typeof val === "number" ? val : Number(val)
  if (isNaN(n)) return ""
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ"
}

type AutoFillFn = (employee: EmployeeWithRelations) => string

export const AUTO_FILL_MAP: Record<string, AutoFillFn> = {
  "employee.fullName":       (e) => e.fullName,
  "employee.employeeCode":   (e) => e.employeeCode,
  "employee.position":       (e) => e.position?.name ?? "",
  "employee.department":     (e) => e.department?.name ?? "",
  "employee.startDate":      (e) => e.startDate ? formatDate(e.startDate) : "",
  "employee.nationalId":     (e) => e.nationalId ?? "",
  "employee.phone":          (e) => e.phone ?? "",
  "employee.bankAccount":    (e) => e.bankAccount ?? "",
  "employee.bankBranch":     (e) => e.bankBranch ?? "",
  "employee.taxCode":        (e) => e.taxCode ?? "",
  "employee.insuranceCode":  (e) => e.insuranceCode ?? "",
  "employee.currentAddress": (e) => e.currentAddress ?? "",
  "employee.permanentAddress": (e) => e.permanentAddress ?? "",
  "employee.companyEmail":   (e) => e.companyEmail ?? "",
  "employee.personalEmail":  (e) => e.personalEmail ?? "",
  "employee.school":         (e) => e.school ?? "",
  "employee.major":          (e) => e.major ?? "",
  "employee.baseSalary":     (e) => formatCurrency(e.contracts[0]?.baseSalary),
  "employee.gender":         (e) => e.gender === "MALE" ? "Nam" : e.gender === "FEMALE" ? "Nữ" : "Khác",
  "employee.dateOfBirth":    (e) => e.dateOfBirth ? formatDate(e.dateOfBirth) : "",
}

export const META_FILL_MAP: Record<string, () => string> = {
  "company.name":           () => "CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM",
  "company.taxCode":        () => "0314718578",
  "company.representative": () => "LƯƠNG VIỆT QUỐC",
  "company.address":        () => "Số 40/10 Khổng Tử, Phường Tăng Nhơn Phú, TP.HCM",
  "meta.today":             () => formatDate(new Date()),
  "meta.month":             () => String(new Date().getMonth() + 1),
  "meta.year":              () => String(new Date().getFullYear()),
}

export const AUTO_FILL_OPTIONS = [
  { value: "", label: "(Không tự động)" },
  { value: "employee.fullName", label: "Họ tên NV" },
  { value: "employee.employeeCode", label: "Mã NV" },
  { value: "employee.position", label: "Chức vụ" },
  { value: "employee.department", label: "Phòng ban" },
  { value: "employee.startDate", label: "Ngày vào làm" },
  { value: "employee.nationalId", label: "CCCD" },
  { value: "employee.phone", label: "SĐT" },
  { value: "employee.bankAccount", label: "Số TK ngân hàng" },
  { value: "employee.bankBranch", label: "Chi nhánh NH" },
  { value: "employee.taxCode", label: "Mã số thuế" },
  { value: "employee.currentAddress", label: "Địa chỉ hiện tại" },
  { value: "employee.permanentAddress", label: "Hộ khẩu" },
  { value: "employee.companyEmail", label: "Email công ty" },
  { value: "employee.personalEmail", label: "Email cá nhân" },
  { value: "employee.baseSalary", label: "Lương cơ bản" },
  { value: "employee.gender", label: "Giới tính" },
  { value: "employee.dateOfBirth", label: "Ngày sinh" },
  { value: "company.name", label: "Tên công ty" },
  { value: "company.taxCode", label: "MST công ty" },
  { value: "company.representative", label: "Người đại diện" },
  { value: "company.address", label: "Địa chỉ công ty" },
  { value: "meta.today", label: "Ngày hôm nay" },
  { value: "meta.month", label: "Tháng hiện tại" },
  { value: "meta.year", label: "Năm hiện tại" },
]
