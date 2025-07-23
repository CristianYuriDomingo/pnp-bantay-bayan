// middleware/auth-middleware.ts - Additional middleware utilities
import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'

// Option 1: If using NextAuth.js
import { Session } from 'next-auth'

/**
 * Middleware function to protect API routes
 */
export async function withApiAuth(
  handler: (request: NextRequest, user: Session['user']) => Promise<Response>,
  request: NextRequest
): Promise<Response> {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          data: null
        },
        { status: 401 }
      )
    }
    
    return await handler(request, user)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        data: null
      },
      { status: 500 }
    )
  }
}

/**
 * Middleware function to protect API routes with role requirement
 */
export async function withApiRole(
  handler: (request: NextRequest, user: Session['user']) => Promise<Response>,
  request: NextRequest,
  requiredRole: string
): Promise<Response> {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          data: null
        },
        { status: 401 }
      )
    }
    
    if (user.role !== requiredRole) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
          data: null
        },
        { status: 403 }
      )
    }
    
    return await handler(request, user)
  } catch (error) {
    console.error('Role middleware error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Authorization failed',
        data: null
      },
      { status: 500 }
    )
  }
}