import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { TEMPLATES_DIR } from "@/lib/config/storage"

const ALLOWED_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const metadataStr = formData.get("metadata") as string | null

  if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 })

  // Validate file type
  if (file.type !== ALLOWED_TYPE && !file.name.endsWith(".docx")) {
    return NextResponse.json({ error: "Chỉ hỗ trợ file .docx" }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File quá lớn (tối đa 10MB)" }, { status: 400 })
  }

  let metadata = { name: "", category: "OFFICIAL_DOCUMENT", description: "" }
  if (metadataStr) {
    try {
      metadata = { ...metadata, ...JSON.parse(metadataStr) }
    } catch {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
    }
  }

  if (!metadata.name) {
    metadata.name = file.name.replace(/\.docx$/i, "")
  }

  // Save file
  const buffer = Buffer.from(await file.arrayBuffer())
  await mkdir(TEMPLATES_DIR, { recursive: true })

  const templateId = crypto.randomUUID()
  const savedFileName = `${templateId}.docx`
  const filePath = join(TEMPLATES_DIR, savedFileName)
  await writeFile(filePath, buffer)

  // Create DB record
  const template = await prisma.documentTemplate.create({
    data: {
      name: metadata.name,
      category: metadata.category as "CONTRACT" | "OFFICIAL_DOCUMENT" | "MEETING" | "RECRUITMENT",
      description: metadata.description || null,
      fileName: file.name,
      filePath: `/templates/library/${savedFileName}`,
      fileSize: file.size,
      fields: [],
      uploadedBy: session.user.id,
    },
  })

  return NextResponse.json({ data: template })
}
