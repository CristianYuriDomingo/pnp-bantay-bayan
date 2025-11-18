// app/api/auth/forgot-password/route.ts - Updated with Resend integration
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationError {
  field: string;
  message: string;
}

function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!email || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (email.length > 254) {
    errors.push({ field: 'email', message: 'Email address is too long' });
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('Processing forgot password request for:', email);

    // Validate input
    const validationErrors = validateEmail(email);
    
    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validationErrors,
          success: false 
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Looking for user with email:', normalizedEmail);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true }
    });

    // Always return success to prevent email enumeration attacks
    const successResponse = {
      message: 'If an account with that email exists, we have sent a password reset link.',
      success: true
    };

    if (!user) {
      console.log('Password reset requested for non-existent email:', normalizedEmail);
      // Still return success to prevent email enumeration
      return NextResponse.json(successResponse, { status: 200 });
    }

    console.log('User found:', user.email);

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    console.log('Generated reset token for user:', user.id);

    // Store reset token in database
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry
        }
      });
      console.log('Reset token stored in database');
    } catch (prismaError) {
      console.error('Failed to store reset token:', prismaError);
      
      return NextResponse.json(
        { 
          message: 'An error occurred while processing your request. Please try again.',
          errors: [{ field: 'general', message: 'Database error occurred' }],
          success: false
        },
        { status: 500 }
      );
    }

    // Send password reset email using Resend
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name || '');
      console.log('Password reset email sent successfully via Resend');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Even if email fails, return success to prevent revealing email existence
      console.log('Email failed but returning success response for security');
    }

    return NextResponse.json(successResponse, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { 
        message: 'An error occurred while processing your request. Please try again.',
        errors: [{ field: 'general', message: 'Server error occurred' }],
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