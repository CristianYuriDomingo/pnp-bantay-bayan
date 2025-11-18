// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reuse the same email sending function
async function sendVerificationEmail(email: string, token: string, name: string = '') {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(80));
    console.log('📧 RESEND EMAIL VERIFICATION - DEVELOPMENT MODE');
    console.log('='.repeat(80));
    console.log(`User: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📋 Copy the Verification URL above and paste it in your browser');
    console.log('='.repeat(80) + '\n');
    
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'email-verification-logs.txt');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] RESEND - ${name} (${email}) | ${verificationUrl}\n`;
      
      fs.appendFileSync(logPath, logEntry);
      console.log(`✅ Verification link also saved to: ${logPath}\n`);
    } catch (err) {
      console.log('⚠️  Could not save to log file\n');
    }
  }
  
  // TODO: Implement actual email sending in production
  
  return true;
}

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

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name || '');
      console.log('✅ Verification email resent successfully');
    } catch (emailError) {
      console.error('⚠️  Failed to resend verification email:', emailError);
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