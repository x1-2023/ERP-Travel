"use client"

import type { ColumnMapping } from "@/lib/ai/import-mapper"
import { Badge } from "@/components/ui/badge"

interface MappingPreviewProps {
  mapping: ColumnMapping
}

export function MappingPreview({ mapping }: MappingPreviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Kết quả mapping AI</h3>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Cột gốc</th>
              <th className="px-4 py-2 text-left font-medium">Field hệ thống</th>
              <th className="px-4 py-2 text-left font-medium">Độ tin cậy</th>
            </tr>
          </thead>
          <tbody>
            {mapping.mappings.map((m, idx) => (
              <tr key={idx} className={`border-t ${m.confidence < 0.7 ? "bg-orange-50" : ""}`}>
                <td className="px-4 py-2">{m.source}</td>
                <td className="px-4 py-2 font-mono text-xs">{m.target}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          m.confidence >= 0.9
                            ? "bg-emerald-500"
                            : m.confidence >= 0.7
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                        }`}
                        style={{ width: `${m.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(m.confidence * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {mapping.unmapped.map((col, idx) => (
              <tr key={`unmapped-${idx}`} className="border-t bg-yellow-50">
                <td className="px-4 py-2">{col}</td>
                <td className="px-4 py-2">
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Không map
                  </Badge>
                </td>
                <td className="px-4 py-2">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mapping.warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm font-medium text-yellow-800 mb-1">Cảnh báo</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            {mapping.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
