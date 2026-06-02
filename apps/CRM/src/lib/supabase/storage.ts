import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BUCKET = 'crm-documents'
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

function getClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function uploadDocument(
  file: Buffer,
  path: string,
  mimeType: string
): Promise<{ path: string }> {
  if (file.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 25MB limit')
  }

  const supabase = getClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)
  return { path: data.path }
}

export async function getSignedUrl(
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = getClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) return null
  return data?.signedUrl ?? null
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export function buildStoragePath(
  entityType: string,
  entityId: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${entityType}/${entityId}/${timestamp}-${safeName}`
}
