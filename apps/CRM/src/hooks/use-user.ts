'use client'

import { useAuth, type AuthUser } from './use-auth'

/** Returns the current authenticated user. */
export function useUser(): { user: AuthUser | null; isLoading: boolean } {
  const { user, isLoading } = useAuth()
  return { user, isLoading }
}
