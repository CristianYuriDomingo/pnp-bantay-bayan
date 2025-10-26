// app/api/users/profile/route.ts - Pass context to achievement checker
import { NextRequest } from 'next/server';
import { withApiAuth } from '@/middleware/auth-middleware';
import { createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { checkAndAwardAchievements } from '@/lib/achievement-checker';

// GET handler function
async function getProfileHandler(request: NextRequest, user: Session['user']) {
  console.log('📋 GET Profile handler called for user:', user.email);
  
  try {
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

    // 🔍 GET CURRENT USER DATA + CHECK EXISTING ACHIEVEMENTS
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: {
        id: true,
        name: true,
        image: true,
        achievementsEarned: {
          select: {
            achievement: {
              select: {
                code: true
              }
            }
          }
        }
      }
    });

    if (!currentUser) {
      return createAuthErrorResponse('User not found', 404);
    }

    // 📌 Check if user already has profile achievements
    const earnedCodes = currentUser.achievementsEarned.map(ua => ua.achievement.code);
    const hasIdentityAchievement = earnedCodes.includes('identity-established');
    const hasFaceAchievement = earnedCodes.includes('face-of-justice');

    // Track which fields are being updated
    const updatedFields: string[] = [];
    
    // Check if name is being updated and achievement not earned
    const isNameBeingUpdated = name && name.trim() !== currentUser.name;
    if (isNameBeingUpdated && !hasIdentityAchievement && name.trim().length > 0) {
      updatedFields.push('name');
    }
    
    // Check if image is being updated and achievement not earned
    const isImageBeingUpdated = image !== undefined && image !== null && image.trim() !== currentUser.image;
    if (isImageBeingUpdated && !hasFaceAchievement && image.trim().length > 0) {
      updatedFields.push('image');
    }

    console.log('🔍 Achievement Check Debug:', {
      currentName: currentUser.name,
      newName: name,
      isNameBeingUpdated,
      currentImage: currentUser.image ? 'exists' : 'none',
      newImage: image ? 'provided' : 'not provided',
      isImageBeingUpdated,
      earnedAchievements: earnedCodes,
      hasIdentityAchievement,
      hasFaceAchievement,
      updatedFields,
    });

    const updateData: any = {
      name: name.trim(),
      updatedAt: new Date()
    };

    // Only update image if provided
    if (image) {
      updateData.image = image;
    }

    // Update user profile
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

    // ⭐ TRIGGER ACHIEVEMENT CHECK with context about what was updated
    if (updatedFields.length > 0) {
      try {
        console.log('🎯 Triggering achievement check for profile_update');
        console.log(`   📝 Fields to check:`, updatedFields);
        
        const achievementResult = await checkAndAwardAchievements(
          updatedUser.id,
          'profile_update',
          { updatedFields }
        );

        if (achievementResult.newAchievements.length > 0) {
          console.log(
            `🎉 User earned ${achievementResult.newAchievements.length} profile achievement(s)!`
          );
          achievementResult.newAchievements.forEach(ua => {
            console.log(`   ✨ ${ua.achievement.name} (+${ua.xpAwarded} XP)`);
          });
        } else {
          console.log('ℹ️ No new achievements awarded (criteria not met or already earned)');
        }
      } catch (achievementError) {
        console.error('⚠️ Achievement check failed:', achievementError);
        // Don't fail the profile update if achievement check fails
      }
    } else {
      console.log('ℹ️ Profile update - no achievement-eligible changes');
    }

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