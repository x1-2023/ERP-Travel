"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays, startOfDay } from "date-fns"
import { CheckCircle2, XCircle, Clock, FileDown } from "lucide-react"

interface Task {
  id: string
  taskKey: string
  title: string
  description: string | null
  assignedRole: string
  status: string
  dueDate: string | null
  doneAt: string | null
  doneBy: string | null
  note: string | null
}

interface OffboardingChecklistProps {
  instanceId: string
  tasks: Task[]
  instanceStatus: string
  employeeId: string
  userRole: string
  onUpdate: () => void
}

const ROLE_LABELS: Record<string, string> = {
  HR_STAFF: "HR",
  DEPT_MANAGER: "QL",
  EMPLOYEE: "NV",
}

function formatDate(d: string | null): string {
  if (!d) return "—"
  try { return format(new Date(d), "dd/MM/yyyy") } catch { return "—" }
}

export function OffboardingChecklist({
  instanceId,
  tasks,
  instanceStatus,
  employeeId,
  userRole,
  onUpdate,
}: OffboardingChecklistProps) {
  const [skipTaskId, setSkipTaskId] = useState<string | null>(null)
  const [skipNote, setSkipNote] = useState("")
  const [error, setError] = useState("")

  const doneTasks = tasks.filter((t) => t.status === "DONE" || t.status === "SKIPPED").length
  const progressPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  const isHR = ["SUPER_ADMIN", "HR_MANAGER", "HR_STAFF"].includes(userRole)

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(
        `/api/offboarding/${instanceId}/tasks/${taskId}/complete`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: onUpdate,
    onError: (err) => setError(err.message),
  })

  const skipMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(
        `/api/offboarding/${instanceId}/tasks/${taskId}/skip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: skipNote }),
        }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    },
    onSuccess: () => {
      setSkipTaskId(null)
      setSkipNote("")
      onUpdate()
    },
    onError: (err) => setError(err.message),
  })

  const handleGenerateHandover = async () => {
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: "HANDOVER_MINUTES" }),
      })
      if (!res.ok) throw new Error("Failed to generate")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Bien-Ban-Ban-Giao.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("Không thể tạo biên bản bàn giao")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Checklist Bàn Giao</CardTitle>
          <span className="text-sm text-muted-foreground">
            {doneTasks}/{tasks.length} ({progressPct}%)
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="space-y-3">
          {tasks.map((task) => {
            const today = startOfDay(new Date())
            const overdueDays = task.dueDate && task.status === "PENDING"
              ? differenceInDays(today, startOfDay(new Date(task.dueDate)))
              : 0
            const isOverdue = overdueDays > 0

            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-md border ${
                  isOverdue ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
              >
                {/* Status icon */}
                {task.status === "DONE" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                ) : task.status === "SKIPPED" ? (
                  <XCircle className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                ) : (
                  <Clock className={`h-5 w-5 mt-0.5 shrink-0 ${isOverdue ? "text-red-500" : "text-amber-500"}`} />
                )}

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${task.status !== "PENDING" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ROLE_LABELS[task.assignedRole] || task.assignedRole}
                    </Badge>
                    {isOverdue && (
                      <span className="text-xs text-red-600 font-medium">
                        ({overdueDays} ngày quá hạn)
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Hạn: {formatDate(task.dueDate)}</span>
                    {task.doneAt && <span>Done: {formatDate(task.doneAt)}</span>}
                    {task.note && <span>Note: {task.note}</span>}
                  </div>
                </div>

                {/* Actions */}
                {task.status === "PENDING" && instanceStatus === "IN_PROGRESS" && (
                  <div className="flex gap-1 shrink-0">
                    {(isHR || userRole === "DEPT_MANAGER" || userRole === "EMPLOYEE") && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(task.id)}
                      >
                        Done
                      </Button>
                    )}
                    {isHR && (
                      <>
                        {skipTaskId === task.id ? (
                          <div className="flex gap-1 items-center">
                            <Input
                              placeholder="Lý do bỏ qua..."
                              value={skipNote}
                              onChange={(e) => setSkipNote(e.target.value)}
                              className="w-40 h-8 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!skipNote || skipMutation.isPending}
                              onClick={() => skipMutation.mutate(task.id)}
                            >
                              OK
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSkipTaskId(null)}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSkipTaskId(task.id)}
                          >
                            Skip
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Generate Biên bản bàn giao */}
        {isHR && (instanceStatus === "IN_PROGRESS" || instanceStatus === "COMPLETED") && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleGenerateHandover}
            >
              <FileDown className="h-4 w-4" />
              Tạo Biên Bản Bàn Giao
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
