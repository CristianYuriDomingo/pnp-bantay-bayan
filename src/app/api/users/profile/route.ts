// app/api/users/profile/route.ts - Using your middleware
import { NextRequest } from 'next/server';
import { withApiAuth } from '@/middleware/auth-middleware';
import { createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

// GET handler function
async function getProfileHandler(request: NextRequest, user: Session['user']) {
  console.log('📋 GET Profile handler called for user:', user.email);
  
  try {
    // Find user by email since that's what we have from session
    const profile = await prisma.user.findUnique({
      where: { email: user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('📊 Profile data fetched:', profile ? 'Found' : 'Not found');

    if (!profile) {
      console.log('❌ Profile not found for email:', user.email);
      return createAuthErrorResponse('Profile not found', 404);
    }

    console.log('✅ Returning profile data');
    return createSuccessResponse(profile, 'Profile fetched successfully');

  } catch (error: unknown) {
    console.error('💥 Profile fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createAuthErrorResponse(`Failed to fetch profile: ${errorMessage}`, 500);
  }
}

// PUT handler function
async function putProfileHandler(request: NextRequest, user: Session['user']) {
  console.log('🔄 PUT Profile handler called for user:', user.email);
  
  try {
    const body = await request.json();
    const { name, image } = body;

    console.log('📝 Update data received:', { name, hasImage: !!image });

    // Validate required fields
    if (!name || !name.trim()) {
      return createAuthErrorResponse('Name is required', 400);
    }

    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date()
    };

    // Only update image if provided
    if (image) {
      updateData.image = image;
    }

    // Update user by email
    const updatedUser = await prisma.user.update({
      where: { email: user.email! },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('✅ Profile updated successfully');
    return createSuccessResponse(updatedUser, 'Profile updated successfully');

  } catch (error: unknown) {
    console.error('💥 Profile update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createAuthErrorResponse(`Failed to update profile: ${errorMessage}`, 500);
  }
}

// Export the route handlers with middleware
export async function GET(request: NextRequest) {
  return withApiAuth(getProfileHandler, request);
}

export async function PUT(request: NextRequest) {
  return withApiAuth(putProfileHandler, request);
}