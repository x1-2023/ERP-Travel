"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { EmployeeFilters } from "@/components/employees/employee-filters"
import { EmployeeTable } from "@/components/employees/employee-table"
import { UserPlus } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

export default function EmployeesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [department, setDepartment] = useState(searchParams.get("department") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10))
  const [sortColumn, setSortColumn] = useState(searchParams.get("sort") || "")
  const [sortOrder, setSortOrder] = useState(searchParams.get("order") || "")

  const debouncedSearch = useDebounce(search, 300)

  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams()
      const merged = { search, department, status, page: String(page), sort: sortColumn, order: sortOrder, ...params }
      for (const [k, v] of Object.entries(merged)) {
        if (v && v !== "all") sp.set(k, v)
      }
      router.push(`/employees?${sp.toString()}`, { scroll: false })
    },
    [search, department, status, page, sortColumn, sortOrder, router]
  )

  const onSort = (column: string) => {
    let newOrder = ""
    if (sortColumn !== column) {
      setSortColumn(column)
      setSortOrder("asc")
      newOrder = "asc"
    } else if (sortOrder === "asc") {
      setSortOrder("desc")
      newOrder = "desc"
    } else {
      setSortColumn("")
      setSortOrder("")
      column = ""
    }
    setPage(1)
    updateUrl({ sort: column, order: newOrder, page: "1" })
  }

  const queryString = new URLSearchParams()
  if (debouncedSearch) queryString.set("search", debouncedSearch)
  if (department && department !== "all") queryString.set("department", department)
  if (status && status !== "all") queryString.set("status", status)
  if (sortColumn) queryString.set("sort", sortColumn)
  if (sortOrder) queryString.set("order", sortOrder)
  queryString.set("page", String(page))
  queryString.set("limit", "20")

  const { data, isLoading } = useQuery({
    queryKey: ["employees", debouncedSearch, department, status, page, sortColumn, sortOrder],
    queryFn: () =>
      fetch(`/api/employees?${queryString.toString()}`).then((r) => r.json()),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
          Quản Lý Nhân Sự
        </h1>
        <Button
          onClick={() => router.push("/employees/new")}
          className="gap-2"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          <UserPlus className="h-4 w-4" />
          Thêm Nhân Viên
        </Button>
      </div>

      <EmployeeFilters
        search={search}
        department={department}
        status={status}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        onDepartmentChange={(v) => {
          setDepartment(v)
          setPage(1)
          updateUrl({ department: v, page: "1" })
        }}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
          updateUrl({ status: v, page: "1" })
        }}
        onReset={() => {
          setSearch("")
          setDepartment("")
          setStatus("")
          setPage(1)
          router.push("/employees")
        }}
      />

      <EmployeeTable
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        totalPages={data?.totalPages || 1}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={onSort}
        onPageChange={(p) => {
          setPage(p)
          updateUrl({ page: String(p) })
        }}
      />
    </div>
  )
}
