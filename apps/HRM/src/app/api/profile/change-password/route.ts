import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/

// POST /api/profile/change-password
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Mật khẩu xác nhận không khớp" }, { status: 400 })
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return NextResponse.json({
      error: "Mật khẩu phải có ít nhất 8 ký tự, chữ hoa và số",
    }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user?.password) {
    return NextResponse.json({ error: "Tài khoản không có mật khẩu" }, { status: 400 })
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      newData: { action: "PASSWORD_CHANGED" },
    },
  })

  return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" })
}
