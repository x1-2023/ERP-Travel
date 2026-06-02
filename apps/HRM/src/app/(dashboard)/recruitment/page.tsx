"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Briefcase, Users, Clock, LayoutGrid, List, Search } from "lucide-react"
import { KanbanBoard, type KanbanApplication } from "@/components/recruitment/kanban-board"
import { useDebounce } from "@/hooks/use-debounce"

interface Requisition {
  id: string
  title: string
  status: string
  department: { name: string }
  position: { name: string }
  requester: { name: string }
  headcount: number
  createdAt: string
  _count: { applications: number }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  OPEN: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã huỷ",
}

export default function RecruitmentPage() {
  const { data: session } = useSession()
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [filterRequisition, setFilterRequisition] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data: reqData, isLoading: reqLoading } = useQuery<{ data: Requisition[] }>({
    queryKey: ["requisitions"],
    queryFn: async () => {
      const res = await fetch("/api/recruitment/requisitions")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const { data: appData, isLoading: appLoading } = useQuery<{ data: KanbanApplication[] }>({
    queryKey: ["all-applications"],
    queryFn: async () => {
      const res = await fetch("/api/recruitment/applications")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: view === "kanban",
  })

  const requisitions = reqData?.data || []
  const allApplications = appData?.data || []
  const open = requisitions.filter((r) => r.status === "OPEN").length
  const totalApps = requisitions.reduce((s, r) => s + r._count.applications, 0)

  // Unique departments from requisitions
  const departments = Array.from(new Set(requisitions.map((r) => r.department.name))).sort()

  // Filter applications
  let filteredApps = allApplications
  if (filterRequisition && filterRequisition !== "__all__") {
    filteredApps = filteredApps.filter((a) => a.requisition?.id === filterRequisition)
  }
  if (filterDepartment && filterDepartment !== "__all__") {
    filteredApps = filteredApps.filter((a) => a.requisition?.department?.name === filterDepartment)
  }
  if (debouncedSearch) {
    const q = debouncedSearch.toLowerCase()
    filteredApps = filteredApps.filter(
      (a) =>
        a.candidate.fullName.toLowerCase().includes(q) ||
        a.candidate.email.toLowerCase().includes(q) ||
        (a.candidate.phone && a.candidate.phone.includes(q))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tuyển Dụng</h1>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              className={view === "kanban" ? "" : "text-slate-500"}
              style={view === "kanban" ? { backgroundColor: "#1E3A5F" } : {}}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className={view === "list" ? "" : "text-slate-500"}
              style={view === "list" ? { backgroundColor: "#1E3A5F" } : {}}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/recruitment/requisitions/new">
            <Button style={{ backgroundColor: "#1E3A5F" }}>
              <Plus className="h-4 w-4 mr-2" /> Tạo yêu cầu
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng YC tuyển dụng</p>
              <p className="text-2xl font-bold">{requisitions.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-slate-300" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Đang tuyển</p>
              <p className="text-2xl font-bold text-emerald-600">{open}</p>
            </div>
            <Clock className="h-8 w-8 text-emerald-200" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Tổng ứng viên</p>
              <p className="text-2xl font-bold text-blue-600">{totalApps}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </CardContent>
        </Card>
      </div>

      {view === "kanban" ? (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterRequisition} onValueChange={setFilterRequisition}>
              <SelectTrigger className="w-[220px] text-sm"><SelectValue placeholder="Tất cả yêu cầu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả yêu cầu</SelectItem>
                {requisitions
                  .filter((r) => r.status === "OPEN")
                  .map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} — {r.department.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px] text-sm"><SelectValue placeholder="Tất cả phòng ban" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả phòng ban</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm ứng viên..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {appLoading || reqLoading ? (
            <div className="text-center py-10 text-slate-400">Đang tải...</div>
          ) : (
            <KanbanBoard
              applications={filteredApps}
              invalidateKeys={[["all-applications"], ["requisitions"]]}
              userRole={session?.user?.role || ""}
            />
          )}
        </>
      ) : (
        /* List view */
        <>
          {reqLoading ? (
            <div className="text-center py-10 text-slate-400">Đang tải...</div>
          ) : requisitions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Chưa có yêu cầu tuyển dụng nào
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requisitions.map((jr) => (
                <Link key={jr.id} href={`/recruitment/requisitions/${jr.id}`}>
                  <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{jr.title}</p>
                        <Badge className={statusColors[jr.status]}>{statusLabels[jr.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{jr.department.name}</span>
                        <span>&middot;</span>
                        <span>{jr.position.name}</span>
                        <span>&middot;</span>
                        <span>Số lượng: {jr.headcount}</span>
                        <span>&middot;</span>
                        <span>{jr._count.applications} ứng viên</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
