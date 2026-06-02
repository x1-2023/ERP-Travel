'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JOB_TYPE, WORK_MODE } from '@/lib/recruitment/constants'
import type { JobPosting } from '@/types/recruitment'
import { JobListingCard } from './job-listing-card'
import { Search, X, Briefcase } from 'lucide-react'

interface JobListingsProps {
  postings: JobPosting[]
  onApply: (posting: JobPosting) => void
  onViewDetails: (posting: JobPosting) => void
  isLoading?: boolean
}

export function JobListings({
  postings,
  onApply,
  onViewDetails,
  isLoading = false,
}: JobListingsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('ALL')
  const [workModeFilter, setWorkModeFilter] = useState<string>('ALL')
  const [locationFilter, setLocationFilter] = useState<string>('ALL')

  // Get unique locations
  const locations = useMemo(() => {
    const locs = new Set<string>()
    postings.forEach((p) => {
      if (p.location) locs.add(p.location)
    })
    return Array.from(locs).sort()
  }, [postings])

  const filteredPostings = useMemo(() => {
    return postings.filter((posting) => {
      const matchesSearch =
        searchQuery === '' ||
        posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesJobType = jobTypeFilter === 'ALL' || posting.jobType === jobTypeFilter
      const matchesWorkMode = workModeFilter === 'ALL' || posting.workMode === workModeFilter
      const matchesLocation =
        locationFilter === 'ALL' || posting.location === locationFilter
      return matchesSearch && matchesJobType && matchesWorkMode && matchesLocation
    })
  }, [postings, searchQuery, jobTypeFilter, workModeFilter, locationFilter])

  const activeFilters = [
    jobTypeFilter !== 'ALL' ? JOB_TYPE[jobTypeFilter]?.label : null,
    workModeFilter !== 'ALL' ? WORK_MODE[workModeFilter]?.label : null,
    locationFilter !== 'ALL' ? locationFilter : null,
  ].filter(Boolean)

  const clearFilters = () => {
    setSearchQuery('')
    setJobTypeFilter('ALL')
    setWorkModeFilter('ALL')
    setLocationFilter('ALL')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cơ hội nghề nghiệp</h1>
        <p className="text-muted-foreground">
          Tìm vị trí phù hợp và phát triển sự nghiệp cùng chúng tôi
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Loại công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {Object.entries(JOB_TYPE).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Hình thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả hình thức</SelectItem>
              {Object.entries(WORK_MODE).map(([key, val]) => (
                <SelectItem key={key} value={key}>
                  {val.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {locations.length > 0 && (
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả địa điểm</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 justify-center">
            <span className="text-xs text-muted-foreground">Lọc theo:</span>
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredPostings.length} vị trí đang tuyển
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredPostings.length > 0 ? (
          filteredPostings.map((posting) => (
            <JobListingCard
              key={posting.id}
              posting={posting}
              onApply={() => onApply(posting)}
              onViewDetails={() => onViewDetails(posting)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-lg font-medium text-muted-foreground">
              Không tìm thấy vị trí phù hợp
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            {activeFilters.length > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
