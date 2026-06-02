import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { STORAGE_BASE } from "@/lib/config/storage"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const template = await prisma.documentTemplate.findUnique({ where: { id } })
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const filePath = join(STORAGE_BASE, template.filePath)
    const content = await readFile(filePath)
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      delimiters: { start: "{", end: "}" },
      paragraphLoop: true,
      linebreaks: true,
    })

    // Get full text and extract placeholders
    const fullText = doc.getFullText()
    const regex = /\{([^}]+)\}/g
    const placeholders: string[] = []
    let match
    while ((match = regex.exec(fullText)) !== null) {
      const key = match[1].trim()
      if (key && !placeholders.includes(key)) {
        placeholders.push(key)
      }
    }

    return NextResponse.json({ data: placeholders })
  } catch (err) {
    console.error("Scan placeholders error:", err)
    return NextResponse.json({ error: "Không thể đọc file template" }, { status: 500 })
  }
}
