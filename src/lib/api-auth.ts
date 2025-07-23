// lib/api-auth.ts - API route authentication utilities
import { auth } from './auth'
import { NextRequest } from 'next/server'
import type { Session } from 'next-auth'

/**
 * Get authenticated user from API route
 */
export async function getApiUser(request?: NextRequest): Promise<Session['user'] | null> {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    console.error('Error getting API user:', error)
    return null
  }
}

/**
 * Require authentication in API route
 * Returns user or throws error with appropriate response
 */
export async function requireApiAuth(request?: NextRequest): Promise<Session['user']> {
  const user = await getApiUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Require specific role in API route
 */
export async function requireApiRole(role: string, request?: NextRequest): Promise<Session['user']> {
  const user = await requireApiAuth(request)
  
  if (user.role !== role) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

/**
 * API response helper for auth errors
 */
export function createAuthErrorResponse(error: string, status: number = 401) {
  return Response.json(
    {
      success: false,
      error,
      data: null
    },
    { status }
  )
}