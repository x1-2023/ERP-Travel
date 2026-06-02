"use client"

import { useSession } from "next-auth/react"
import { AttendanceGrid } from "@/components/attendance/attendance-grid"
import { MyAttendance } from "@/components/attendance/my-attendance"

export default function AttendancePage() {
  const { data: session } = useSession()
  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF", "DEPT_MANAGER"].includes(session?.user?.role || "")

  return isHR ? <AttendanceGrid /> : <MyAttendance />
}
