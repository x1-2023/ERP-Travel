import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"

const RTR_ONBOARDING_TASKS = [
  {
    taskKey: "COMPANY_EMAIL",
    title: "Tạo email công ty",
    description: "Tạo tài khoản email @vierp.com cho nhân viên",
    dueDays: 1,
  },
  {
    taskKey: "SYSTEM_ACCESS",
    title: "Cấp quyền truy cập hệ thống",
    description: "Tạo tài khoản HRM, email nội bộ, các công cụ làm việc",
    dueDays: 1,
  },
  {
    taskKey: "BANK_ACCOUNT_CONFIRM",
    title: "Xác nhận số tài khoản ngân hàng",
    description: "Thu thập và verify STK ngân hàng để thanh toán lương",
    dueDays: 3,
  },
  {
    taskKey: "TAX_CODE_DECLARE",
    title: "Khai báo mã số thuế",
    description: "Nhân viên cung cấp MST cá nhân để khấu trừ thuế TNCN",
    dueDays: 5,
  },
  {
    taskKey: "NDA_SIGNED",
    title: "Ký Thỏa thuận Bảo mật (NDA)",
    description: "Ký Thỏa thuận Bảo mật Thông tin và Không Cạnh tranh RTR",
    dueDays: 3,
  },
  {
    taskKey: "HR_DOCS_COLLECTED",
    title: "Nộp hồ sơ đầy đủ",
    description: "CCCD, bằng cấp, sơ yếu lý lịch, giấy khám sức khỏe, ảnh 3x4",
    dueDays: 7,
  },
  {
    taskKey: "EQUIPMENT_ISSUED",
    title: "Cấp phát thiết bị làm việc",
    description: "Laptop, thiết bị, công cụ theo yêu cầu công việc",
    dueDays: 1,
  },
  {
    taskKey: "ORIENTATION_DONE",
    title: "Hoàn tất định hướng nhân viên mới",
    description: "Giới thiệu công ty, nội quy, văn hóa, các phòng ban",
    dueDays: 3,
  },
]

export async function createOnboardingChecklist(employeeId: string, startDate: Date) {
  // Check if checklist already exists
  const existing = await prisma.onboardingChecklist.findUnique({
    where: { employeeId },
    include: { tasks: true },
  })
  if (existing) return existing

  return prisma.onboardingChecklist.create({
    data: {
      employeeId,
      tasks: {
        create: RTR_ONBOARDING_TASKS.map((task) => ({
          taskKey: task.taskKey,
          title: task.title,
          description: task.description,
          dueDate: addDays(startDate, task.dueDays),
          status: "PENDING",
        })),
      },
    },
    include: { tasks: true },
  })
}
