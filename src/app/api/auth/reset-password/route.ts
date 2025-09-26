// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface ValidationError {
  field: string;
  message: string;
}

function validatePassword(password: string, confirmPassword: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
    return errors;
  }

  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    return errors;
  }

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    return errors;
  }

  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }

  if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password is too long (max 128 characters)' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)' 
    });
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456789', 'qwerty123', 'abc123456', 
    'password123', '12345678', 'admin123', 'user123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push({ field: 'password', message: 'This password is too common. Please choose a stronger one' });
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validate inputs
    if (!token || !token.trim()) {
      return NextResponse.json(
        { 
          message: 'Invalid reset token', 
          errors: [{ field: 'token', message: 'Reset token is required' }],
          success: false 
        },
        { status: 400 }
      );
    }

    const validationErrors = validatePassword(password, confirmPassword);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validationErrors,
          success: false 
        },
        { status: 400 }
      );
    }

    // Find user by reset token and check if token is still valid
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token.trim(),
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      },
      select: { id: true, email: true, name: true, resetToken: true, resetTokenExpiry: true }
    });

    if (!user) {
      return NextResponse.json(
        { 
          message: 'Invalid or expired reset token. Please request a new password reset.',
          errors: [{ field: 'general', message: 'Reset link is invalid or has expired' }],
          success: false
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    console.log(`Password successfully reset for user: ${user.email}`);

    return NextResponse.json(
      { 
        message: 'Password has been reset successfully. You can now sign in with your new password.',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      { 
        message: 'An error occurred while resetting your password. Please try again.',
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