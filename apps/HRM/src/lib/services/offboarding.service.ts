import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"

const RTR_OFFBOARDING_TASKS = [
  {
    taskKey: "RESIGNATION_LETTER",
    title: "Đơn xin nghỉ việc đã ký",
    description: "BM01 - Đơn xin nghỉ việc được ký bởi nhân viên, quản lý và HR",
    assignedRole: "HR_STAFF",
    dueDays: 0,
  },
  {
    taskKey: "WORK_HANDOVER",
    title: "Bàn giao công việc",
    description: "Nhân viên bàn giao toàn bộ dự án, tài liệu, công việc đang thực hiện",
    assignedRole: "DEPT_MANAGER",
    dueDays: 7,
  },
  {
    taskKey: "ASSET_RETURN",
    title: "Hoàn trả tài sản công ty",
    description: "Laptop, thiết bị, thẻ từ, đồng phục và các tài sản khác",
    assignedRole: "HR_STAFF",
    dueDays: -1,
  },
  {
    taskKey: "SYSTEM_ACCESS_REVOKE",
    title: "Thu hồi quyền truy cập hệ thống",
    description: "Vô hiệu hóa email công ty, tài khoản HRM, Slack, Git và các hệ thống khác",
    assignedRole: "HR_STAFF",
    dueDays: -1,
  },
  {
    taskKey: "FINAL_PAYROLL",
    title: "Thanh toán lương lần cuối",
    description: "Tính và thanh toán lương tháng cuối bao gồm ngày phép còn lại",
    assignedRole: "HR_STAFF",
    dueDays: 10,
  },
  {
    taskKey: "SOCIAL_INSURANCE_CLOSE",
    title: "Đóng sổ bảo hiểm xã hội",
    description: "Nộp hồ sơ BHXH, trả sổ BHXH cho nhân viên",
    assignedRole: "HR_STAFF",
    dueDays: 30,
  },
  {
    taskKey: "EMPLOYMENT_CERTIFICATE",
    title: "Cấp xác nhận thôi việc",
    description: "Xác nhận thời gian làm việc và chức vụ để NV dùng cho nơi làm việc mới",
    assignedRole: "HR_STAFF",
    dueDays: 3,
  },
  {
    taskKey: "NDA_REMINDER",
    title: "Nhắc nhở cam kết bảo mật",
    description: "Nhắc nhở NV về Thỏa thuận Bảo mật Thông tin còn hiệu lực sau khi nghỉ",
    assignedRole: "HR_STAFF",
    dueDays: -1,
  },
  {
    taskKey: "HANDOVER_MINUTES_SIGNED",
    title: "Biên bản bàn giao được ký",
    description: "Biên bản bàn giao công việc và tài sản được ký bởi tất cả các bên",
    assignedRole: "HR_STAFF",
    dueDays: -1,
  },
]

export function createOffboardingTasks(
  instanceId: string,
  hrApprovedAt: Date,
  lastWorkingDate: Date,
) {
  return prisma.offboardingTask.createMany({
    data: RTR_OFFBOARDING_TASKS.map((task) => ({
      instanceId,
      taskKey: task.taskKey,
      title: task.title,
      description: task.description,
      assignedRole: task.assignedRole,
      status: "PENDING" as const,
      dueDate: task.dueDays === -1
        ? lastWorkingDate
        : addDays(hrApprovedAt, task.dueDays),
    })),
  })
}
