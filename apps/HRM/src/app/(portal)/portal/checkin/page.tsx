"use client"

import { CheckinButton } from "@/components/portal/checkin-button"
import { MyAttendance } from "@/components/attendance/my-attendance"

export default function PortalCheckinPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <CheckinButton />

      {/* Monthly history - reuse existing component */}
      <div className="mt-6">
        <MyAttendance />
      </div>
    </div>
  )
}
