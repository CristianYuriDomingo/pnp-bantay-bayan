// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('🔍 Email verification attempt with token:', token?.substring(0, 10) + '...');

    if (!token || !token.trim()) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { 
          message: 'Invalid verification link', 
          success: false 
        },
        { status: 400 }
      );
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token.trim(),
        verificationTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true
      }
    });

    if (!user) {
      console.log('❌ Invalid or expired verification token');
      return NextResponse.json(
        { 
          message: 'Invalid or expired verification link. Please request a new verification email.',
          success: false 
        },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log('ℹ️  Email already verified for:', user.email);
      return NextResponse.json(
        { 
          message: 'Email is already verified. You can sign in now.',
          alreadyVerified: true,
          success: true 
        },
        { status: 200 }
      );
    }

    console.log('✅ Verifying email for user:', user.email);

    // Mark email as verified and activate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        status: 'active', // 🆕 Activate the account
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    console.log('🎉 Email verified successfully for:', user.email);

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now sign in.',
        success: true,
        user: {
          email: user.email,
          name: user.name
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 Email verification error:', error);
    
    return NextResponse.json(
      { 
        message: 'An error occurred during verification. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. Use GET with token parameter.' },
    { status: 405 }
  );
}