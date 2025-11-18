// app/api/auth/resend-verification/route.ts - Updated with Resend integration
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('📧 Resend verification request for:', email);

    // Validate email
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { 
          message: 'Please provide a valid email address',
          success: false 
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        status: true,
        password: true // Check if it's a credentials user
      }
    });

    // Always return success to prevent email enumeration
    const successResponse = {
      message: 'If an unverified account exists with that email, we have sent a new verification link.',
      success: true
    };

    if (!user) {
      console.log('ℹ️  No user found with email:', normalizedEmail);
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Check if user signed up with OAuth (no password)
    if (!user.password) {
      console.log('ℹ️  OAuth user - no verification needed:', user.email);
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log('ℹ️  Email already verified:', user.email);
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔄 Generating new verification token for:', user.email);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry
      }
    });

    // Send verification email using Resend
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name || '');
      console.log('✅ Verification email resent successfully via Resend');
    } catch (emailError) {
      console.error('⚠️  Failed to resend verification email:', emailError);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    console.error('💥 Resend verification error:', error);
    
    return NextResponse.json(
      { 
        message: 'An error occurred. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}