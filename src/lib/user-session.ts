// lib/user-session.ts - Server-side session utilities
import { auth } from './auth'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

/**
 * Get current authenticated user from server-side
 * Use this in Server Components and API routes
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Get current user ID - throws if not authenticated
 * Use this when you need to ensure user is authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }
  return session.user.id
}

/**
 * Require authentication - redirects to signin if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth(): Promise<Session['user']> {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  return session.user
}

/**
 * Check if current user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await auth()
  return session?.user?.role === role
}

/**
 * Require specific role - redirects if user doesn't have role
 */
export async function requireRole(role: string): Promise<Session['user']> {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  if (session.user.role !== role) {
    redirect('/unauthorized')
  }
  return session.user
}