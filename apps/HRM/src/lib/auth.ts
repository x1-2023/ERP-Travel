import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

// Brute-force protection: max 5 failed attempts per email, lockout for 15 minutes
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

function checkLoginAttempt(email: string): string | null {
  const entry = loginAttempts.get(email)
  if (!entry) return null
  if (Date.now() > entry.lockedUntil) {
    loginAttempts.delete(email)
    return null
  }
  if (entry.count >= MAX_ATTEMPTS) {
    const remainMin = Math.ceil((entry.lockedUntil - Date.now()) / 60000)
    return `Tài khoản tạm khóa. Thử lại sau ${remainMin} phút.`
  }
  return null
}

function recordFailedAttempt(email: string) {
  const entry = loginAttempts.get(email)
  if (!entry) {
    loginAttempts.set(email, { count: 1, lockedUntil: Date.now() + LOCKOUT_MS })
  } else {
    entry.count++
    entry.lockedUntil = Date.now() + LOCKOUT_MS
  }
}

function clearAttempts(email: string) {
  loginAttempts.delete(email)
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of Array.from(loginAttempts.entries())) {
    if (now > val.lockedUntil) loginAttempts.delete(key)
  }
}, 30 * 60 * 1000)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        // Check brute-force lockout
        const lockError = checkLoginAttempt(email)
        if (lockError) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          recordFailedAttempt(email)
          return null
        }
        if (!user.isActive) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          recordFailedAttempt(email)
          return null
        }

        clearAttempts(email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})
