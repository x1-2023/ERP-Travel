import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import fs from "fs"
import path from "path"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const RTR = {
  name:    "CÔNG TY CỔ PHẦN REAL-TIME ROBOTICS VIỆT NAM",
  mst:     "0314718578",
  address: "Số 40/10 Khổng Tử, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh",
  ceo:     "LƯƠNG VIỆT QUỐC",
  phone:   "0969 864 578",
  email:   "info@vierp.com",
  bank:    "13610000031054 – NHTMCP Đầu tư và Phát triển VN – CN Bình Thạnh",
}

function formatCurrencyDoc(value: unknown): string {
  if (value === null || value === undefined) return "..."
  const n = Number(value)
  if (isNaN(n) || n === 0) return "..."
  return new Intl.NumberFormat("vi-VN").format(Math.round(n))
}

function formatDate(date: Date | string | null | undefined, fmt = "dd/MM/yyyy"): string {
  if (!date) return "..."
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, fmt, { locale: vi })
}

interface EmployeeData {
  id: string
  employeeCode: string
  fullName: string
  gender: string
  dateOfBirth: Date | string | null
  permanentAddress: string | null
  currentAddress: string | null
  phone: string | null
  nationalId: string | null
  nationalIdDate: Date | string | null
  nationalIdPlace: string | null
  personalEmail: string | null
  startDate: Date | string | null
  department: { name: string } | null
  position: { name: string } | null
}

interface ContractData {
  type: string
  contractNo: string | null
  probationNo: string | null
  probationFrom: Date | string | null
  probationTo: Date | string | null
  officialFrom: Date | string | null
  officialTo: Date | string | null
  baseSalary?: unknown
  mealAllowance?: unknown
  phoneAllowance?: unknown
  fuelAllowance?: unknown
  perfAllowance?: unknown
  kpiAmount?: unknown
}

function buildContractTypeText(contract?: ContractData | null): string {
  if (!contract) return "..."
  switch (contract.type) {
    case "INDEFINITE_TERM": return "Không xác định thời hạn"
    case "DEFINITE_TERM":
      return `Xác định thời hạn đến ngày ${formatDate(contract.officialTo)}`
    case "PROBATION":
      return `Thử việc đến ngày ${formatDate(contract.probationTo)}`
    case "INTERN":
      return `Thực tập đến ngày ${formatDate(contract.officialTo)}`
    default: return "..."
  }
}

function buildTemplateData(employee: EmployeeData, contract?: ContractData | null) {
  return {
    ho_va_ten:           employee.fullName,
    nam_sinh:            formatDate(employee.dateOfBirth),
    ngay_thang_nam_sinh: formatDate(employee.dateOfBirth),
    cccd:                employee.nationalId ?? "...",
    ngay_cap:            formatDate(employee.nationalIdDate),
    noi_cap:             employee.nationalIdPlace ?? "Cục cảnh sát QLHC về TTXH",
    dia_chi_thuong_tru:  employee.permanentAddress ?? "...",
    dia_chi_hien_tai:    employee.currentAddress ?? "...",
    dien_thoai:          employee.phone ?? "...",
    email_ca_nhan:       employee.personalEmail ?? "...",
    chuc_vu:             employee.position?.name ?? "...",
    ma_nhan_vien:        employee.employeeCode,
    ngay_vao:            formatDate(employee.startDate),

    so_hd_chinh_thuc:      contract?.contractNo ?? "___/____-HĐLĐ-RTR",
    so_hd_thu_viec:        contract?.probationNo ?? "___/____-HĐTV-RTR",
    ngay_ky_hd_chinh_thuc: formatDate(contract?.officialFrom),
    ngay_ky_hd_thu_viec:   formatDate(contract?.probationFrom),
    den_ngay:              formatDate(contract?.probationTo ?? contract?.officialTo),
    han_hop_dong:          buildContractTypeText(contract),

    tien_luong:         formatCurrencyDoc(contract?.baseSalary),
    tien_com_trua:      formatCurrencyDoc(contract?.mealAllowance),
    tien_dien_thoai:    formatCurrencyDoc(contract?.phoneAllowance),
    tien_xang_xe:       formatCurrencyDoc(contract?.fuelAllowance),
    hieu_qua_cong_viec: formatCurrencyDoc(contract?.perfAllowance),
    kpi:                formatCurrencyDoc(contract?.kpiAmount),
    tong_luong:         formatCurrencyDoc(
      Number(contract?.baseSalary ?? 0) +
      Number(contract?.mealAllowance ?? 0) +
      Number(contract?.phoneAllowance ?? 0) +
      Number(contract?.fuelAllowance ?? 0) +
      Number(contract?.perfAllowance ?? 0)
    ),

    cong_ty_ten:   RTR.name,
    cong_ty_mst:   RTR.mst,
    cong_ty_dc:    RTR.address,
    giam_doc:      RTR.ceo,
    cong_ty_phone: RTR.phone,
    cong_ty_email: RTR.email,
    cong_ty_bank:  RTR.bank,

    ngay_hom_nay: format(new Date(), "dd/MM/yyyy"),
    nam_nay:      format(new Date(), "yyyy"),
  }
}

const TEMPLATE_MAP: Record<string, string> = {
  CONTRACT_PROBATION: "hop-dong-thu-viec.docx",
  CONTRACT_OFFICIAL:  "hop-dong-chinh-thuc.docx",
  CONTRACT_INTERN:    "thoa-thuan-thuc-tap.docx",
  NDA:                "thoa-thuan-bao-mat.docx",
  RESIGNATION_LETTER: "don-xin-nghi-viec.docx",
  HANDOVER_MINUTES:   "bien-ban-ban-giao.docx",
}

export async function generateDocument(params: {
  documentType: string
  employee: EmployeeData
  contract?: ContractData | null
}): Promise<Buffer> {
  const { documentType, employee, contract } = params

  const templateFile = TEMPLATE_MAP[documentType]
  if (!templateFile) throw new Error(`Unknown document type: ${documentType}`)

  const templatePath = path.join(process.cwd(), "public", "templates", templateFile)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }

  const content = fs.readFileSync(templatePath, "binary")
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  const data = buildTemplateData(employee, contract)
  doc.render(data)

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  })

  return buf
}
