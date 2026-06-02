import { prisma } from "@/lib/prisma"
import { notificationService } from "@/lib/services/notification.service"
import { emailService } from "@/lib/services/email.service"
import { addDays, startOfDay, endOfDay, format } from "date-fns"

const ALERT_DAYS = [30, 15, 7] as const

export async function checkContractExpiry() {
  const today = startOfDay(new Date())
  const results: string[] = []

  for (const days of ALERT_DAYS) {
    const targetDate = addDays(today, days)

    const contracts = await prisma.contract.findMany({
      where: {
        status: "ACTIVE",
        officialTo: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate),
        },
      },
      include: {
        employee: {
          select: {
            fullName: true,
            companyEmail: true,
          },
        },
      },
    })

    for (const contract of contracts) {
      const expiryDate = format(contract.officialTo!, "dd/MM/yyyy")
      const contractNo = contract.contractNo || contract.id

      // In-app notification for HR
      await notificationService.notifyHR({
        type: "CONTRACT_EXPIRY",
        title: `Hợp đồng sắp hết hạn (${days} ngày)`,
        message: `HĐ ${contractNo} của ${contract.employee.fullName} hết hạn ngày ${expiryDate}`,
        link: `/employees`,
        metadata: {
          contractId: contract.id,
          employeeName: contract.employee.fullName,
          daysLeft: days,
        },
      })

      // Email to HR
      const hrUsers = await prisma.user.findMany({
        where: {
          role: { in: ["HR_MANAGER", "HR_STAFF"] },
          isActive: true,
        },
        select: { email: true },
      })

      for (const hrUser of hrUsers) {
        await emailService.sendContractExpiryAlert({
          toEmail: hrUser.email,
          employeeName: contract.employee.fullName,
          contractNo,
          expiryDate,
          daysLeft: days,
        })
      }

      results.push(`${contract.employee.fullName} — ${days} days — ${contractNo}`)
    }
  }

  // Auto-expire contracts past their end date
  const expiredContracts = await prisma.contract.findMany({
    where: {
      status: "ACTIVE",
      officialTo: { lt: startOfDay(new Date()) },
    },
    include: {
      employee: { select: { fullName: true, employeeCode: true } },
    },
  })

  const autoExpired: string[] = []
  for (const contract of expiredContracts) {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "EXPIRED" },
    })
    autoExpired.push(`${contract.employee.fullName} (${contract.contractNo || contract.id})`)

    await notificationService.notifyHR({
      type: "CONTRACT_EXPIRY",
      title: "Hợp đồng đã hết hạn",
      message: `HĐ ${contract.contractNo || contract.id} của ${contract.employee.fullName} đã hết hạn và được chuyển sang EXPIRED`,
      link: `/employees`,
    })
  }

  return {
    checkedAt: new Date().toISOString(),
    alertDays: ALERT_DAYS,
    alerts: results,
    count: results.length,
    autoExpired,
    autoExpiredCount: autoExpired.length,
  }
}
