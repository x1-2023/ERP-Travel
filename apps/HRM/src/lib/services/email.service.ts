import nodemailer from "nodemailer"

const RTR_COMPANY = {
  name: "Công ty TNHH VietERP Việt Nam",
  shortName: "RTR Vietnam",
  address: "Lô E2a-7, Đường D1, Khu CNC, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM",
  phone: "(028) 3636 0099",
  email: "hr@rtr.vn",
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: { user, pass },
  })
}

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1E3A5F;padding:20px 32px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;">${RTR_COMPANY.shortName} — HRM</h1>
  </td></tr>
  <tr><td style="padding:32px;">
    ${content}
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#64748b;">
      ${RTR_COMPANY.name}<br/>
      ${RTR_COMPANY.address}<br/>
      ${RTR_COMPANY.phone} | ${RTR_COMPANY.email}
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

async function send(to: string, subject: string, html: string) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[Email] SMTP not configured — skipping email to ${to}: ${subject}`)
    return null
  }

  try {
    const result = await transporter.sendMail({
      from: `"${RTR_COMPANY.shortName} HRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[Email] Sent to ${to}: ${subject}`)
    return result
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error)
    return null
  }
}

export interface PayslipEmailData {
  toEmail: string
  employeeName: string
  employeeCode: string
  month: number
  year: number
  baseSalary: number
  totalContractSalary: number
  totalActualSalary: number
  actualDays: number
  standardDays: number
  items: { type: string; label: string; amount: number }[]
  totalEmployeeIns: number
  pitAmount: number
  advanceDeduction: number
  netSalary: number
  bankAccount: string
  bankName: string
}

function fmtVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ"
}

function maskBank(account: string): string {
  if (!account || account.length <= 4) return account || "—"
  return "****" + account.slice(-4)
}

function buildPayslipHtml(p: PayslipEmailData): string {
  const period = `${String(p.month).padStart(2, "0")}/${p.year}`
  const nextMonth = p.month === 12 ? 1 : p.month + 1
  const nextYear = p.month === 12 ? p.year + 1 : p.year
  const estimatedPayDate = `05-10/${String(nextMonth).padStart(2, "0")}/${nextYear}`

  const bonusItems = p.items.filter((i) => i.amount > 0 && !i.type.includes("DEDUCTION"))
  const bonusRows = bonusItems.map((i) =>
    `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;">${i.label}</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtVND(i.amount)}</td></tr>`
  ).join("")

  return baseTemplate(`
    <h2 style="color:#1E3A5F;margin-top:0;">Phiếu Lương Tháng ${period}</h2>
    <p>Xin chào <strong>${p.employeeName}</strong> (${p.employeeCode}),</p>
    <p>Phiếu lương kỳ <strong>${period}</strong> của bạn:</p>

    <!-- Thông Tin Công -->
    <h3 style="color:#1E3A5F;margin-bottom:8px;font-size:14px;">Thông Tin Công</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;width:50%;">Ngày công thực tế</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${p.actualDays}/${p.standardDays}</td></tr>
    </table>

    <!-- Lương HĐ -->
    <h3 style="color:#1E3A5F;margin-bottom:8px;font-size:14px;">Lương Hợp Đồng</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;width:50%;">Lương cơ bản</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtVND(p.baseSalary)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Tổng lương HĐ</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtVND(p.totalContractSalary)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Lương thực tế</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${fmtVND(p.totalActualSalary)}</td></tr>
    </table>

    ${bonusRows ? `
    <!-- Tăng Thêm -->
    <h3 style="color:#1E3A5F;margin-bottom:8px;font-size:14px;">Tăng Thêm</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${bonusRows}
    </table>
    ` : ""}

    <!-- Khấu Trừ -->
    <h3 style="color:#1E3A5F;margin-bottom:8px;font-size:14px;">Khấu Trừ</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;width:50%;">BH người lao động</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;">${fmtVND(p.totalEmployeeIns)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Thuế TNCN</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;">${fmtVND(p.pitAmount)}</td></tr>
      ${p.advanceDeduction > 0 ? `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Trừ tạm ứng</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;color:#dc2626;">${fmtVND(p.advanceDeduction)}</td></tr>` : ""}
    </table>

    <!-- THỰC LĨNH -->
    <div style="background:#f0f9ff;border:2px solid #1E3A5F;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;">THỰC LĨNH</p>
      <p style="margin:0;color:#1E3A5F;font-size:28px;font-weight:bold;">${fmtVND(p.netSalary)}</p>
    </div>

    <!-- Ngân Hàng -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;width:50%;">Số TK ngân hàng</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${maskBank(p.bankAccount)}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Ngân hàng</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${p.bankName || "—"}</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:bold;">Dự kiến chuyển khoản</td><td style="padding:6px 8px;border:1px solid #e2e8f0;text-align:right;">${estimatedPayDate}</td></tr>
    </table>

    <p style="font-size:12px;color:#94a3b8;margin-top:24px;">Đây là phiếu lương điện tử. Vui lòng không reply email này.</p>
  `)
}

export const emailService = {
  send,

  async sendContractExpiryAlert(params: {
    toEmail: string
    employeeName: string
    contractNo: string
    expiryDate: string
    daysLeft: number
  }) {
    const html = baseTemplate(`
      <h2 style="color:#1E3A5F;margin-top:0;">Thông báo hợp đồng sắp hết hạn</h2>
      <p>Xin chào,</p>
      <p>Hợp đồng lao động của nhân viên sau sắp hết hạn:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;width:40%;">Nhân viên</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.employeeName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Số hợp đồng</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.contractNo}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Ngày hết hạn</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.expiryDate}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Còn lại</td><td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;font-weight:bold;">${params.daysLeft} ngày</td></tr>
      </table>
      <p>Vui lòng kiểm tra và xử lý gia hạn hoặc tái ký hợp đồng kịp thời.</p>
    `)
    return send(params.toEmail, `[HRM] Hợp đồng sắp hết hạn — ${params.employeeName} (${params.daysLeft} ngày)`, html)
  },

  async sendWelcomeEmployee(params: {
    toEmail: string
    employeeName: string
    employeeCode: string
  }) {
    const html = baseTemplate(`
      <h2 style="color:#1E3A5F;margin-top:0;">Chào mừng đến với ${RTR_COMPANY.shortName}!</h2>
      <p>Xin chào <strong>${params.employeeName}</strong>,</p>
      <p>Chúng tôi rất vui mừng chào đón bạn gia nhập đội ngũ ${RTR_COMPANY.name}.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;width:40%;">Mã nhân viên</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.employeeCode}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Email công ty</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.toEmail}</td></tr>
      </table>
      <p>Chúc bạn có những trải nghiệm tuyệt vời tại RTR!</p>
    `)
    return send(params.toEmail, `[HRM] Chào mừng ${params.employeeName} đến với ${RTR_COMPANY.shortName}`, html)
  },

  async sendPayslip(params: PayslipEmailData) {
    const html = buildPayslipHtml(params)
    return send(params.toEmail, `[HRM] Phiếu lương tháng ${params.month}/${params.year} — ${params.employeeName}`, html)
  },

  buildPayslipHtml(params: PayslipEmailData): string {
    return buildPayslipHtml(params)
  },

  isSmtpConfigured(): boolean {
    return getTransporter() !== null
  },

  async sendReportPendingApproval(params: {
    toEmail: string
    managerName: string
    employeeName: string
    reportType: string
  }) {
    const html = baseTemplate(`
      <h2 style="color:#1E3A5F;margin-top:0;">Báo cáo chờ duyệt</h2>
      <p>Xin chào <strong>${params.managerName}</strong>,</p>
      <p>Có một báo cáo mới cần bạn phê duyệt:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;width:40%;">Loại báo cáo</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.reportType}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Nhân viên</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.employeeName}</td></tr>
      </table>
      <p>Vui lòng đăng nhập hệ thống HRM để xem và xử lý.</p>
    `)
    return send(params.toEmail, `[HRM] Báo cáo chờ duyệt — ${params.employeeName}`, html)
  },

  async sendReportReturned(params: {
    toEmail: string
    employeeName: string
    reportType: string
    reason: string
  }) {
    const html = baseTemplate(`
      <h2 style="color:#1E3A5F;margin-top:0;">Báo cáo bị trả lại</h2>
      <p>Xin chào <strong>${params.employeeName}</strong>,</p>
      <p>Báo cáo của bạn đã bị trả lại và cần chỉnh sửa:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;width:40%;">Loại báo cáo</td><td style="padding:8px;border:1px solid #e2e8f0;">${params.reportType}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Lý do</td><td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;">${params.reason}</td></tr>
      </table>
      <p>Vui lòng đăng nhập hệ thống HRM để chỉnh sửa và gửi lại.</p>
    `)
    return send(params.toEmail, `[HRM] Báo cáo bị trả lại — ${params.reportType}`, html)
  },
}
