import { join } from "node:path"

export const STORAGE_BASE = process.env.RENDER_DISK_PATH || join(process.cwd(), "public")
export const TEMPLATES_DIR = join(STORAGE_BASE, "templates/library")
