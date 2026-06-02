// src/app/(dashboard)/payroll/components/page.tsx
// Salary Components Page

import { Metadata } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_SALARY_COMPONENTS, COMPONENT_CATEGORY_LABELS, ITEM_TYPE_LABELS } from "@/lib/payroll/constants"

export const metadata: Metadata = {
  title: "Thành phần lương | Lạc Việt HR",
  description: "Quản lý các thành phần cấu thành lương",
}

export default function SalaryComponentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thành phần lương</h1>
          <p className="text-muted-foreground">
            Quản lý các khoản cấu thành bảng lương
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thành phần
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thành phần lương</CardTitle>
          <CardDescription>
            Các khoản thu nhập, khấu trừ cấu thành bảng lương
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Chịu thuế</TableHead>
                <TableHead>Hệ thống</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEFAULT_SALARY_COMPONENTS.map((comp) => (
                <TableRow key={comp.code}>
                  <TableCell className="font-medium">{comp.code}</TableCell>
                  <TableCell>{comp.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={comp.itemType === "EARNING" ? "default" : "destructive"}
                    >
                      {ITEM_TYPE_LABELS[comp.itemType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {COMPONENT_CATEGORY_LABELS[comp.category]}
                  </TableCell>
                  <TableCell>
                    {comp.isTaxable ? "Có" : "Không"}
                  </TableCell>
                  <TableCell>
                    {comp.isSystem ? (
                      <Badge variant="secondary">Hệ thống</Badge>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
