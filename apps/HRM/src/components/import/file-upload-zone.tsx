"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

export function FileUploadZone({ onFileSelect, selectedFile, onClear }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      alert("Chỉ hỗ trợ file .xlsx, .xls, .csv")
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn (tối đa 10MB)")
      return false
    }
    return true
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && validateFile(file)) onFileSelect(file)
    },
    [onFileSelect, validateFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && validateFile(file)) onFileSelect(file)
    },
    [onFileSelect, validateFile]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 p-4">
        <FileSpreadsheet className="h-8 w-8 text-[#1E3A5F]" />
        <div className="flex-1">
          <p className="font-medium text-sm">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging ? "border-[#1E3A5F] bg-[#1E3A5F]/5" : "border-muted-foreground/25 hover:border-[#1E3A5F]/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">Kéo thả file vào đây hoặc nhấn để chọn</p>
        <p className="text-xs text-muted-foreground mt-1">Hỗ trợ .xlsx, .xls, .csv (tối đa 10MB, 5.000 hàng)</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
