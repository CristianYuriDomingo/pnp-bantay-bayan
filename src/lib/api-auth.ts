// lib/api-auth.ts - Complete implementation
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Adjust path to your auth config
import { NextResponse } from 'next/server';
import { Session } from 'next-auth';

/**
 * Get authenticated user from NextAuth session
 * This is the function your middleware is looking for
 */
export async function getApiUser(request: NextRequest): Promise<Session['user'] | null> {
  console.log('🔍 getApiUser called');
  
  try {
    // Method 1: Try to get session directly (recommended for App Router)
    const session = await getServerSession(authOptions);
    
    if (session && session.user) {
      console.log('✅ Session found via getServerSession:', session.user.email);
      return session.user;
    }

    // Method 2: If direct method fails, try with request context
    // This is a fallback for edge cases
    console.log('🔄 Trying alternative session retrieval...');
    
    // Get cookies from request
    const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (!sessionToken) {
      console.log('❌ No session token found in cookies');
      return null;
    }

    // Make internal request to session endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      if (sessionData && sessionData.user) {
        console.log('✅ Session found via internal request:', sessionData.user.email);
        return sessionData.user;
      }
    }

    console.log('❌ No valid session found');
    return null;
    
  } catch (error) {
    console.error('💥 getApiUser error:', error);
    return null;
  }
}

/**
 * Legacy function - throws error if not authenticated
 * Use getApiUser instead for better error handling
 */
export async function requireApiAuth(request: NextRequest): Promise<Session['user']> {
  console.log('🔐 requireApiAuth called');
  
  const user = await getApiUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!user.email) {
    throw new Error('Invalid user session');
  }
  
  console.log('✅ Authentication successful for user:', user.email);
  return user;
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any, message: string = 'Success') {
  return NextResponse.json({
    success: true,
    data,
    message,
    error: null
  });
}

/**
 * Create error response
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return NextResponse.json({
    success: false,
    error: message,
    message,
    data: null
  }, { status });
}