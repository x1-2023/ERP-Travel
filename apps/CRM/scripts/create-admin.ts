/**
 * Create demo users in Supabase Auth + Prisma User table.
 * Usage: npx tsx scripts/create-admin.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  let val = trimmed.slice(eqIdx + 1)
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  if (!process.env[key]) process.env[key] = val
}

import { createClient } from '@supabase/supabase-js'
import { PrismaClient, UserRole } from '@prisma/client'

const DEMO_USERS = [
  { email: 'admin@your-domain.com', password: 'Admin@123456', name: 'Admin User', role: 'ADMIN' as UserRole },
  { email: 'manager@your-domain.com', password: 'Manager@123456', name: 'Manager User', role: 'MANAGER' as UserRole },
  { email: 'member@your-domain.com', password: 'Member@123456', name: 'Member User', role: 'MEMBER' as UserRole },
]

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const prisma = new PrismaClient()

  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()

    for (const demo of DEMO_USERS) {
      const existing = existingUsers?.users?.find((u) => u.email === demo.email)

      let authUserId: string

      if (existing) {
        console.log(`[${demo.role}] Supabase auth user exists: ${existing.id}`)
        authUserId = existing.id
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: demo.email,
          password: demo.password,
          email_confirm: true,
        })

        if (error) {
          console.error(`[${demo.role}] Failed to create Supabase auth user:`, error.message)
          continue
        }

        authUserId = data.user.id
        console.log(`[${demo.role}] Created Supabase auth user: ${authUserId}`)
      }

      const user = await prisma.user.upsert({
        where: { id: authUserId },
        update: { role: demo.role, name: demo.name },
        create: {
          id: authUserId,
          email: demo.email,
          name: demo.name,
          role: demo.role,
        },
      })

      console.log(`  -> ${user.email} | ${user.role} | ${user.id}`)
    }

    console.log('\nDemo accounts ready:')
    for (const demo of DEMO_USERS) {
      console.log(`  ${demo.role.padEnd(8)} ${demo.email.padEnd(20)} ${demo.password}`)
    }
    console.log(`\nLogin at: http://localhost:3018/login`)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
