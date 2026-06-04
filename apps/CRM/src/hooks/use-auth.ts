'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
}

export function useAuth() {
  const router = useRouter()
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [dbUser, setDbUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch DB user profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setDbUser(data)
        return data as AuthUser
      }
    } catch {
      // Profile fetch failed silently
    }
    return null
  }, [])

  useEffect(() => {
    let active = true
    fetchProfile().then((profile) => {
      if (!active) return
      if (profile) {
        setIsLoading(false)
      }
    })

    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      return () => {
        active = false
      }
    }

    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return
      setAuthUser(user)
      if (user) {
        fetchProfile()
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return
        const user = session?.user ?? null
        setAuthUser(user)
        if (user) {
          fetchProfile()
        } else {
          fetchProfile().then((profile) => {
            if (!profile) setDbUser(null)
          })
        }
        setIsLoading(false)
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    await fetch('/api/erp-bridge/logout', { method: 'POST' }).catch(() => undefined)
    setAuthUser(null)
    setDbUser(null)
    router.push('/login')
    router.refresh()
  }, [router])

  return {
    user: dbUser,
    authUser,
    isLoading,
    isAuthenticated: !!authUser || !!dbUser,
    logout,
  }
}

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !key.includes('placeholder'))
}
