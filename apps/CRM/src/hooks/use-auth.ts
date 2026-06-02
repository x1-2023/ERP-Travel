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
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setDbUser(data)
      }
    } catch {
      // Profile fetch failed silently
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user)
      if (user) {
        fetchProfile(user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null
        setAuthUser(user)
        if (user) {
          fetchProfile(user.id)
        } else {
          setDbUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const logout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthUser(null)
    setDbUser(null)
    router.push('/login')
    router.refresh()
  }, [router])

  return {
    user: dbUser,
    authUser,
    isLoading,
    isAuthenticated: !!authUser,
    logout,
  }
}
