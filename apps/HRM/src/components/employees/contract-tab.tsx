"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency as fmtCurrencyUtil } from "@/lib/utils/format"
import { Plus, FileDown, Loader2, CheckCircle2 } from "lucide-react"
import { ContractForm } from "./contract-form"

interface GeneratedDoc {
  id: string
  type: string
  fileName: string
  generatedAt: string
}

interface ContractItem {
  id: string
  type: string
  status: string
  contractNo: string | null
  probationNo: string | null
  probationFrom: string | null
  probationTo: string | null
  officialFrom: string | null
  officialTo: string | null
  baseSalary: number | null
  mealAllowance: number | null
  phoneAllowance: number | null
  fuelAllowance: number | null
  perfAllowance: number | null
  kpiAmount: number | null
  annexNo1: string | null
  annexDate1: string | null
  annexNo2: string | null
  annexDate2: string | null
  annexNo3: string | null
  annexDate3: string | null
  notes: string | null
  generatedDocuments: GeneratedDoc[]
  createdAt: string
}

const TYPE_LABELS: Record<string, string> = {
  PROBATION: "HĐ Thử Việc",
  DEFINITE_TERM: "HĐ Có Thời Hạn",
  INDEFINITE_TERM: "HĐ Vô Thời Hạn",
  SEASONAL: "HĐ Thời Vụ",
  PART_TIME: "HĐ Bán Thời Gian",
  INTERN: "Thỏa Thuận Thực Tập",
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-amber-100 text-amber-700",
  TERMINATED: "bg-red-100 text-red-700",
}

function fmtCurrency(val: number | null): string {
  return fmtCurrencyUtil(val)
}

function fmtDate(d: string | null): string {
  return formatDate(d)
}

export function ContractTab({ employeeId }: { employeeId: string }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null)

  const canActivate = session?.user?.role === "HR_MANAGER" || session?.user?.role === "SUPER_ADMIN"

  const { data, isLoading } = useQuery<{ data: ContractItem[] }>({
    queryKey: ["contracts", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/contracts`)
      return res.json()
    },
  })

  const { data: docsData } = useQuery<{ data: { id: string; type: string; fileName: string; generatedAt: string; generatedByUser: { name: string } }[] }>({
    queryKey: ["documents", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}/documents`)
      return res.json()
    },
  })

  const activateMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const res = await fetch(`/api/employees/${employeeId}/contracts/${contractId}/activate`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] })
    },
  })

  async function handleGenerateDoc(documentType: string, contractId?: string) {
    setGeneratingDoc(documentType)
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, contractId }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Lỗi tạo tài liệu")
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition")
      const fileNameMatch = disposition?.match(/filename="([^"]+)"/)
      const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : "document.docx"

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)

      queryClient.invalidateQueries({ queryKey: ["documents", employeeId] })
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] })
    } finally {
      setGeneratingDoc(null)
    }
  }

  const contracts = data?.data || []
  const docs = docsData?.data || []

  if (isLoading) return <div className="text-center py-8 text-slate-400">Đang tải...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold" style={{ color: "#1E3A5F" }}>Hợp Đồng Lao Động</h3>
        <Button size="sm" style={{ backgroundColor: "#1E3A5F" }} onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm Hợp Đồng
        </Button>
      </div>

      {showCreate && (
        <ContractForm
          employeeId={employeeId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false)
            queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] })
          }}
        />
      )}

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Chưa có hợp đồng nào
          </CardContent>
        </Card>
      ) : (
        contracts.map((c) => {
          const docType = c.type === "PROBATION" ? "CONTRACT_PROBATION" : c.type === "INTERN" ? "CONTRACT_INTERN" : "CONTRACT_OFFICIAL"

          return (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                    <span className="font-medium text-sm">{TYPE_LABELS[c.type] || c.type}</span>
                  </div>
                  {canActivate && c.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activateMutation.isPending}
                      onClick={() => activateMutation.mutate(c.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Kích hoạt
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-slate-500">Số HĐ:</span> {c.contractNo || c.probationNo || "—"}</div>
                  {c.type === "PROBATION" ? (
                    <div><span className="text-slate-500">Thời hạn:</span> {fmtDate(c.probationFrom)} → {fmtDate(c.probationTo)}</div>
                  ) : (
                    <div><span className="text-slate-500">Thời hạn:</span> {fmtDate(c.officialFrom)} → {fmtDate(c.officialTo) === "—" ? "Vô thời hạn" : fmtDate(c.officialTo)}</div>
                  )}
                  {c.baseSalary !== undefined && (
                    <div><span className="text-slate-500">Lương CB:</span> {fmtCurrency(c.baseSalary)}</div>
                  )}
                  {(c.mealAllowance || c.phoneAllowance || c.fuelAllowance) && (
                    <div className="text-slate-500 text-xs">
                      Phụ cấp:
                      {c.mealAllowance ? ` Cơm ${fmtCurrency(c.mealAllowance)}` : ""}
                      {c.phoneAllowance ? ` | ĐT ${fmtCurrency(c.phoneAllowance)}` : ""}
                      {c.fuelAllowance ? ` | Xăng ${fmtCurrency(c.fuelAllowance)}` : ""}
                    </div>
                  )}
                </div>

                {/* Annexes */}
                {(c.annexNo1 || c.annexNo2 || c.annexNo3) && (
                  <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                    {c.annexNo1 && <div>Phụ lục 1: {c.annexNo1} — {fmtDate(c.annexDate1)}</div>}
                    {c.annexNo2 && <div>Phụ lục 2: {c.annexNo2} — {fmtDate(c.annexDate2)}</div>}
                    {c.annexNo3 && <div>Phụ lục 3: {c.annexNo3} — {fmtDate(c.annexDate3)}</div>}
                  </div>
                )}

                {/* Document generation buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generatingDoc !== null}
                    onClick={() => handleGenerateDoc(docType, c.id)}
                  >
                    {generatingDoc === docType ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileDown className="h-3 w-3 mr-1" />}
                    Tải {TYPE_LABELS[c.type]}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generatingDoc !== null}
                    onClick={() => handleGenerateDoc("NDA")}
                  >
                    {generatingDoc === "NDA" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileDown className="h-3 w-3 mr-1" />}
                    Tải NDA
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Generated documents list */}
      {docs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tài liệu đã tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{doc.fileName}</span>
                  <span className="text-xs text-slate-400">
                    {fmtDate(doc.generatedAt)} — {doc.generatedByUser.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
