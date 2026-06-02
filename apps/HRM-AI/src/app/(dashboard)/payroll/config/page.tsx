// src/app/(dashboard)/payroll/config/page.tsx
// Payroll Config Page

import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  PIT_BRACKETS,
  PIT_DEDUCTIONS,
  INSURANCE_RATES,
  INSURANCE_SALARY_CAP,
  OT_RATES,
  WORK_SETTINGS,
  formatVND,
} from "@/lib/payroll/constants"

export const metadata: Metadata = {
  title: "Cấu hình lương | Lạc Việt HR",
  description: "Cấu hình tham số tính lương",
}

export default function PayrollConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cấu hình lương</h1>
        <p className="text-muted-foreground">
          Tham số tính lương theo quy định Việt Nam 2024-2026
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bảo hiểm xã hội</CardTitle>
            <CardDescription>
              Tỷ lệ đóng BHXH/BHYT/BHTN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium">Loại</div>
              <div className="font-medium text-center">NLĐ</div>
              <div className="font-medium text-center">Công ty</div>

              <div>BHXH</div>
              <div className="text-center">{INSURANCE_RATES.BHXH.EMPLOYEE * 100}%</div>
              <div className="text-center">{INSURANCE_RATES.BHXH.EMPLOYER * 100}%</div>

              <div>BHYT</div>
              <div className="text-center">{INSURANCE_RATES.BHYT.EMPLOYEE * 100}%</div>
              <div className="text-center">{INSURANCE_RATES.BHYT.EMPLOYER * 100}%</div>

              <div>BHTN</div>
              <div className="text-center">{INSURANCE_RATES.BHTN.EMPLOYEE * 100}%</div>
              <div className="text-center">{INSURANCE_RATES.BHTN.EMPLOYER * 100}%</div>

              <div className="font-semibold border-t pt-2">Tổng</div>
              <div className="text-center font-semibold border-t pt-2">
                {INSURANCE_RATES.TOTAL_EMPLOYEE * 100}%
              </div>
              <div className="text-center font-semibold border-t pt-2">
                {INSURANCE_RATES.TOTAL_EMPLOYER * 100}%
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">Mức trần lương đóng BH</div>
              <div className="text-lg font-semibold">
                {formatVND(INSURANCE_SALARY_CAP)}
              </div>
              <div className="text-xs text-muted-foreground">
                = 20 x Lương cơ sở (2.340.000)
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thuế TNCN</CardTitle>
            <CardDescription>
              Biểu thuế lũy tiến 7 bậc
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {PIT_BRACKETS.map((bracket, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {bracket.from === 0
                      ? `Đến ${formatVND(bracket.to)}`
                      : bracket.to === Infinity
                        ? `Trên ${formatVND(bracket.from)}`
                        : `${formatVND(bracket.from)} - ${formatVND(bracket.to)}`}
                  </span>
                  <span className="font-medium">{bracket.rate * 100}%</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Giảm trừ bản thân</div>
                <div className="font-semibold">{formatVND(PIT_DEDUCTIONS.PERSONAL)}/tháng</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Giảm trừ người phụ thuộc</div>
                <div className="font-semibold">{formatVND(PIT_DEDUCTIONS.DEPENDENT)}/người/tháng</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hệ số tăng ca</CardTitle>
            <CardDescription>
              Theo Bộ luật Lao động 2019
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Ngày thường</span>
              <span className="font-semibold">{OT_RATES.WEEKDAY * 100}%</span>
            </div>
            <div className="flex justify-between">
              <span>Cuối tuần</span>
              <span className="font-semibold">{OT_RATES.WEEKEND * 100}%</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày lễ</span>
              <span className="font-semibold">{OT_RATES.HOLIDAY * 100}%</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Phụ cấp đêm (22:00-06:00)</span>
              <span className="font-semibold">+{OT_RATES.NIGHT_BONUS * 100}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cài đặt ngày công</CardTitle>
            <CardDescription>
              Tham số ngày công chuẩn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Ngày công chuẩn/tháng</span>
              <span className="font-semibold">{WORK_SETTINGS.STANDARD_WORK_DAYS} ngày</span>
            </div>
            <div className="flex justify-between">
              <span>Giờ công/ngày</span>
              <span className="font-semibold">{WORK_SETTINGS.STANDARD_WORK_HOURS} giờ</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>OT tối đa/ngày</span>
              <span className="font-semibold">{WORK_SETTINGS.MAX_OT_HOURS_DAY} giờ</span>
            </div>
            <div className="flex justify-between">
              <span>OT tối đa/tháng</span>
              <span className="font-semibold">{WORK_SETTINGS.MAX_OT_HOURS_MONTH} giờ</span>
            </div>
            <div className="flex justify-between">
              <span>OT tối đa/năm</span>
              <span className="font-semibold">{WORK_SETTINGS.MAX_OT_HOURS_YEAR} giờ</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
