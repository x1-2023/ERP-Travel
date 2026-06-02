'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ReportResult } from '@/types/report'
import { Download, Save, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ReportResultProps {
  result: ReportResult
  onSave?: () => void
  onExport?: () => void
}

export function ReportResultView({ result, onSave, onExport }: ReportResultProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{result.title}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4" />
              Tạo lúc:{' '}
              {format(new Date(result.generatedAt), 'HH:mm dd/MM/yyyy', {
                locale: vi,
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.summary).map(([key, value]) => (
            <div key={key} className="bg-muted p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{key}</p>
            </div>
          ))}
        </div>

        {/* Data Table */}
        {result.data.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {result.columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((row, index) => (
                  <TableRow key={index}>
                    {result.columns.map((col) => (
                      <TableCell key={col.key}>
                        {String(row[col.key] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {result.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không có dữ liệu trong khoảng thời gian này
          </div>
        )}
      </CardContent>
    </Card>
  )
}
