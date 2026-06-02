import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import * as XLSX from "xlsx"

const TEMPLATES: Record<string, { headers: string[]; example: string[][]; guide: string[][] }> = {
  EMPLOYEES: {
    headers: [
      "Họ tên", "Giới tính", "Ngày sinh", "SĐT", "CCCD",
      "Ngày cấp CCCD", "Nơi cấp CCCD", "Địa chỉ thường trú", "Địa chỉ hiện tại",
      "Phòng ban", "Chức vụ", "Ngày vào làm", "Số TK ngân hàng", "Chi nhánh NH",
      "Mã số thuế", "Mã BHXH", "Email công ty", "Email cá nhân", "Biển số xe",
      "Trường", "Chuyên ngành",
    ],
    example: [
      ["Nguyễn Văn A", "Nam", "15/03/1990", "0901234567", "012345678901",
       "20/01/2020", "CA Hà Nội", "123 Phố ABC, Hà Nội", "456 Đường XYZ, HCM",
       "Kỹ Thuật", "Kỹ sư phần mềm", "01/03/2024", "123456789", "Vietcombank HCM",
       "1234567890", "VC12345678", "a.nguyen@rtr.vn", "a.nguyen@gmail.com", "59A-12345",
       "ĐH Bách Khoa HCM", "CNTT"],
      ["Trần Thị B", "Nữ", "20/07/1995", "0912345678", "098765432101",
       "15/06/2021", "CA HCM", "789 Đường DEF, HCM", "789 Đường DEF, HCM",
       "Nhân Sự", "Chuyên viên HR", "15/06/2024", "987654321", "Techcombank HN",
       "9876543210", "VC98765432", "b.tran@rtr.vn", "b.tran@gmail.com", "",
       "ĐH Kinh Tế HCM", "Quản trị nhân lực"],
    ],
    guide: [
      ["Cột", "Bắt buộc", "Định dạng", "Ghi chú"],
      ["Họ tên", "Có", "Text", "Họ và tên đầy đủ"],
      ["Giới tính", "Không", "Nam/Nữ/Khác", "Mặc định: Khác"],
      ["Ngày sinh", "Không", "dd/MM/yyyy", "VD: 15/03/1990"],
      ["SĐT", "Không", "0xxxxxxxxx", "10-11 số, bắt đầu bằng 0"],
      ["CCCD", "Không", "12 số", "Số CCCD/CMND"],
      ["Phòng ban", "Không", "Text", "Tự tạo mới nếu chưa có"],
      ["Chức vụ", "Không", "Text", "Tự tạo mới nếu chưa có"],
      ["Ngày vào làm", "Không", "dd/MM/yyyy", "VD: 01/03/2024"],
    ],
  },
  PAYROLL: {
    headers: ["Mã NV", "Tên NV", "Tháng", "Năm", "Lương cơ bản", "Phụ cấp cơm", "Phụ cấp ĐT", "Phụ cấp xăng", "Phụ cấp hiệu suất", "Ngày công thực tế", "Ngày công chuẩn", "Ghi chú"],
    example: [
      ["RTR-2026-001", "Nguyễn Văn A", "3", "2026", "15000000", "1000000", "500000", "500000", "1000000", "22", "22", ""],
      ["RTR-2026-002", "Trần Thị B", "3", "2026", "12000000", "1000000", "300000", "300000", "800000", "20", "22", "Nghỉ 2 ngày"],
    ],
    guide: [
      ["Cột", "Bắt buộc", "Định dạng", "Ghi chú"],
      ["Mã NV hoặc Tên NV", "Có (1 trong 2)", "Text", "Ưu tiên Mã NV"],
      ["Tháng", "Có", "1-12", "Tháng lương"],
      ["Năm", "Có", "2020-2030", "Năm lương"],
      ["Lương cơ bản", "Không", "Số", "VD: 15000000"],
      ["Phụ cấp", "Không", "Số", "Các loại phụ cấp"],
      ["Ngày công", "Không", "Số", "Mặc định: 22"],
    ],
  },
  ATTENDANCE: {
    headers: ["Mã NV", "Tên NV", "Ngày", "Giờ vào", "Giờ ra", "Trạng thái"],
    example: [
      ["RTR-2026-001", "Nguyễn Văn A", "01/03/2026", "08:00", "17:30", "Có mặt"],
      ["RTR-2026-001", "Nguyễn Văn A", "02/03/2026", "08:45", "17:30", "Đi muộn"],
    ],
    guide: [
      ["Cột", "Bắt buộc", "Định dạng", "Ghi chú"],
      ["Mã NV hoặc Tên NV", "Có (1 trong 2)", "Text", "Ưu tiên Mã NV"],
      ["Ngày", "Có", "dd/MM/yyyy", "VD: 01/03/2026"],
      ["Giờ vào", "Không", "HH:mm", "VD: 08:00"],
      ["Giờ ra", "Không", "HH:mm", "VD: 17:30"],
      ["Trạng thái", "Không", "Text", "Có mặt/Đi muộn/Vắng/Nghỉ phép"],
    ],
  },
  CONTRACTS: {
    headers: ["Mã NV", "Tên NV", "Loại HĐ", "Số HĐ", "Từ ngày TV", "Đến ngày TV", "Từ ngày chính thức", "Đến ngày chính thức", "Lương cơ bản", "Phụ cấp cơm", "Phụ cấp ĐT", "Phụ cấp xăng", "Phụ cấp hiệu suất", "KPI", "Ghi chú"],
    example: [
      ["RTR-2026-001", "Nguyễn Văn A", "Có thời hạn", "HD-001", "", "", "01/03/2024", "01/03/2026", "15000000", "1000000", "500000", "500000", "1000000", "2000000", ""],
      ["RTR-2026-002", "Trần Thị B", "Thử việc", "TV-002", "01/06/2024", "01/08/2024", "", "", "10000000", "1000000", "", "", "", "", "HĐ thử việc"],
    ],
    guide: [
      ["Cột", "Bắt buộc", "Định dạng", "Ghi chú"],
      ["Mã NV hoặc Tên NV", "Có (1 trong 2)", "Text", "Ưu tiên Mã NV"],
      ["Loại HĐ", "Có", "Text", "Thử việc/Có thời hạn/Không thời hạn/Thời vụ/Bán thời gian/Thực tập"],
      ["Số HĐ", "Không", "Text", "Mã số hợp đồng"],
      ["Ngày", "Không", "dd/MM/yyyy", "Ngày bắt đầu/kết thúc"],
      ["Lương/Phụ cấp", "Không", "Số", "VD: 15000000"],
    ],
  },
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (!type || !TEMPLATES[type]) {
    return NextResponse.json({ error: "Loại template không hợp lệ" }, { status: 400 })
  }

  const template = TEMPLATES[type]
  const wb = XLSX.utils.book_new()

  // Data sheet
  const dataRows = [template.headers, ...template.example]
  const ws = XLSX.utils.aoa_to_sheet(dataRows)
  ws["!cols"] = template.headers.map(() => ({ wch: 20 }))
  XLSX.utils.book_append_sheet(wb, ws, "Dữ liệu")

  // Guide sheet
  const guideWs = XLSX.utils.aoa_to_sheet(template.guide)
  guideWs["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, guideWs, "Hướng dẫn")

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  const typeLabels: Record<string, string> = {
    EMPLOYEES: "NhanSu",
    PAYROLL: "Luong",
    ATTENDANCE: "ChamCong",
    CONTRACTS: "HopDong",
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Template_${typeLabels[type]}.xlsx"`,
    },
  })
}
