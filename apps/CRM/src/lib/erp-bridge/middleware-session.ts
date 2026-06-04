import type { NextRequest } from 'next/server'

export async function hasValidErpCrmSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('erp_crm_session')?.value
  if (!token) return false

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return false

  const expected = await sign(encodedPayload)
  if (!safeEqual(signature, expected)) return false

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as { sub?: string; exp?: number; source?: string }
    return Boolean(payload.sub && payload.source === 'erp' && payload.exp && payload.exp >= Math.floor(Date.now() / 1000))
  } catch {
    return false
  }
}

async function sign(encodedPayload: string): Promise<string> {
  const secret = process.env.ERP_CRM_BRIDGE_SECRET ?? process.env.ERP_SESSION_SECRET
  if (!secret || secret.length < 24) return ''

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload))
  return base64UrlEncode(new Uint8Array(signature))
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let result = 0
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return result === 0
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

function base64UrlEncode(input: Uint8Array): string {
  let binary = ''
  input.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}
