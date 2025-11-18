// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name validation (no numbers, special chars except spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-']{2,50}$/;

interface ValidationError {
  field: string;
  message: string;
}

function validateInput(name: string, email: string, password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate name
  if (!name || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (!NAME_REGEX.test(name.trim())) {
    errors.push({ 
      field: 'name', 
      message: 'Name must be 2-50 characters long and contain only letters, spaces, hyphens, or apostrophes' 
    });
  }

  // Validate email
  if (!email || email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else if (email.length > 254) {
    errors.push({ field: 'email', message: 'Email address is too long' });
  }

  // Validate password
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  } else if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password is too long (max 128 characters)' });
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    });
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456789', 'qwerty123', 'abc123456', 
    'password123', '12345678', 'admin123', 'user123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push({ field: 'password', message: 'Password is too common. Please choose a stronger password' });
  }

  return errors;
}

// 🆕 Send verification email function
async function sendVerificationEmail(email: string, token: string, name: string = '') {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL VERIFICATION - DEVELOPMENT MODE');
    console.log('='.repeat(80));
    console.log(`User: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token Expires: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}`);
    console.log('='.repeat(80));
    console.log('📋 Copy the Verification URL above and paste it in your browser');
    console.log('='.repeat(80) + '\n');
    
    // Save to log file for easier access
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'email-verification-logs.txt');
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${name} (${email}) | ${verificationUrl}\n`;
      
      fs.appendFileSync(logPath, logEntry);
      console.log(`✅ Verification link also saved to: ${logPath}\n`);
    } catch (err) {
      console.log('⚠️  Could not save to log file\n');
    }
  }
  
  // TODO: In production, implement actual email sending here
  // Example with a service like SendGrid, AWS SES, or Resend:
  /*
  await emailService.send({
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to Bantay Bayan!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email Address</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  });
  */
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log('📝 Registration attempt for:', email);

    // Validate input
    const validationErrors = validateInput(name, email, password);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: validationErrors,
          success: false 
        },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      console.log('❌ User already exists:', normalizedEmail);
      return NextResponse.json(
        { 
          message: 'User already exists with this email',
          errors: [{ field: 'email', message: 'An account with this email already exists' }],
          success: false
        },
        { status: 409 }
      );
    }

    // Hash password with higher cost factor for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🆕 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔐 Creating user with pending verification...');

    // 🆕 Create user with pending status
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        status: 'pending', // 🆕 Not active until verified
        emailVerified: null, // 🆕 Not verified yet
        verificationToken: verificationToken,
        verificationTokenExpiry: verificationTokenExpiry
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    console.log('✅ User created with pending status:', user.email);

    // 🆕 Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name || '');
      console.log('📧 Verification email sent successfully');
    } catch (emailError) {
      console.error('⚠️  Failed to send verification email:', emailError);
      // Continue anyway - user is created, they can request a new verification email
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully! Please check your email to verify your account.',
        requiresVerification: true, // 🆕 Tell frontend verification is needed
        email: user.email, // 🆕 Send email back for display
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        },
        success: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('💥 Registration error:', error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          message: 'Email address is already registered',
          errors: [{ field: 'email', message: 'An account with this email already exists' }],
          success: false
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Registration failed. Please try again.',
        errors: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }],
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