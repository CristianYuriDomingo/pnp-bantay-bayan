// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    const validationErrors = validateInput(name, email, password);
    
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

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
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

    // Create user with default 'user' role
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        status: 'active'
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

    console.log('User created successfully:', user.email);

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user,
        success: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
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