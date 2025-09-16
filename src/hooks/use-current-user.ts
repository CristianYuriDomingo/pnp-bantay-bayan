// src/hooks/use-current-user.ts - Custom hooks for user data
'use client'
import { useUser } from '@/contexts/user-context'
import type { Session } from 'next-auth'

/**
 * Get current user data
 */
export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useUser()
  return { user, isLoading, isAuthenticated }
}

/**
 * Get current user ID
 */
export function useCurrentUserId(): string | null {
  const { user } = useUser()
  return user?.id || null
}

/**
 * Check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { hasRole } = useUser()
  return hasRole(role)
}

/**
 * Check if user is admin
 */
export function useIsAdmin(): boolean {
  return useHasRole('admin')
}

/**
 * Hook for protected components - shows loading or requires auth
 */
export function useAuthGuard(): {
  user: Session['user']
  isLoading: boolean
} {
  const { user, isLoading, isAuthenticated } = useUser()
  
  if (isLoading) {
    return { user: null as any, isLoading: true }
  }
  
  if (!isAuthenticated || !user) {
    // You could redirect here or throw an error
    throw new Error('Authentication required')
  }
  
  return { user, isLoading: false }
}