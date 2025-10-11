// app/api/users/progress/lesson/[lessonId]/route.ts - COMPLETE FIXED VERSION
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { BadgeService } from '@/lib/badge-service'

function addCacheHeaders(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  return response
}

// Helper function to safely create/update progress with retry logic
async function safeUpsertProgress(
  userId: string, 
  moduleId: string, 
  lessonId: string, 
  timeSpent: number, 
  progress: number, 
  maxRetries = 3
) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      // Use a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // First, try to find existing progress for THIS SPECIFIC USER
        const existingProgress = await tx.userProgress.findUnique({
          where: {
            userId_moduleId_lessonId: {
              userId: userId,
              moduleId: moduleId,
              lessonId: lessonId
            }
          }
        });

        if (existingProgress) {
          // Update existing record - ONLY if it belongs to this user
          if (existingProgress.userId !== userId) {
            throw new Error(`Data integrity violation: Progress record belongs to different user`);
          }
          
          return await tx.userProgress.update({
            where: {
              userId_moduleId_lessonId: {
                userId: userId,
                moduleId: moduleId,
                lessonId: lessonId
              }
            },
            data: {
              completed: true,
              timeSpent: timeSpent,
              progress: progress,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new record - explicitly set userId to prevent race condition issues
          return await tx.userProgress.create({
            data: {
              userId: userId,
              moduleId: moduleId,
              lessonId: lessonId,
              completed: true,
              timeSpent: timeSpent,
              progress: progress
            }
          });
        }
      });

      // If we get here, the operation was successful
      return { success: true, data: result };

    } catch (error) {
      attempt++;
      
      if (error instanceof PrismaClientKnownRequestError) {
        // Handle unique constraint violations (P2002)
        if (error.code === 'P2002' && attempt < maxRetries) {
          console.log(`🔄 Retry attempt ${attempt} for user ${userId} on lesson ${lessonId} due to race condition`);
          // Wait a small random amount to avoid thundering herd
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          continue;
        }
      }
      
      // If it's not a retryable error or we've exhausted retries
      console.error(`❌ Failed to upsert progress for user ${userId} after ${attempt} attempts:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  return { 
    success: false, 
    error: `Failed to update progress after ${maxRetries} attempts due to race condition` 
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await getApiUser(request)
   
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    // ✅ FIX: Fetch complete user data including level and totalXP
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        totalXP: true,
      }
    })

    if (!fullUser) {
      return addCacheHeaders(createAuthErrorResponse('User not found', 404))
    }

    const { lessonId } = params
    const body = await request.json()
    const { timeSpent = 0, progress = 100 } = body

    console.log(`📚 User ${fullUser.email} (ID: ${fullUser.id}) completing lesson ${lessonId}`)

    // Verify lesson exists and get module info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            lessons: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!lesson) {
      return addCacheHeaders(createAuthErrorResponse('Lesson not found', 404))
    }

    // Check if lesson is already completed to avoid duplicate badge awards
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId_lessonId: {
          userId: fullUser.id,
          moduleId: lesson.moduleId,
          lessonId: lessonId
        }
      }
    });

    const isAlreadyCompleted = existingProgress?.completed || false;

    // Use the safe upsert function with retry logic
    const upsertResult = await safeUpsertProgress(
      fullUser.id,
      lesson.moduleId,
      lessonId,
      timeSpent,
      progress
    );

    if (!upsertResult.success || !upsertResult.data) {
      console.error(`❌ Failed to update progress for user ${fullUser.email}:`, upsertResult.error);
      return addCacheHeaders(createAuthErrorResponse(
        `Failed to update lesson progress: ${upsertResult.error}`, 
        500
      ));
    }

    const lessonProgress = upsertResult.data;

    // Calculate module progress - ONLY for this user with additional verification
    const allLessonsInModule = lesson.module.lessons.map(l => l.id)
    const completedLessonsInModule = await prisma.userProgress.count({
      where: {
        userId: fullUser.id,
        moduleId: lesson.moduleId,
        lessonId: {
          in: allLessonsInModule
        },
        completed: true
      }
    })

    const moduleProgressPercentage = Math.round((completedLessonsInModule / allLessonsInModule.length) * 100)
    const isModuleCompleted = completedLessonsInModule === allLessonsInModule.length

    // Badge awarding (only if not already completed)
    let badgeResult: {
      success: boolean;
      newBadges: any[];
      errors: string[];
    } = {
      success: true,
      newBadges: [],
      errors: []
    };

    if (!isAlreadyCompleted) {
      console.log(`🏆 Checking badges for user ${fullUser.email} on lesson ${lessonId}`);
     
      try {
        badgeResult = await BadgeService.awardBadgesForLessonCompletion(
          fullUser.id,
          lessonId,
          lesson.moduleId
        );

        if (badgeResult.success && badgeResult.newBadges.length > 0) {
          console.log(`🎊 SUCCESS: User ${fullUser.email} earned ${badgeResult.newBadges.length} new badges!`);
        }
      } catch (error) {
        console.error(`❌ Badge awarding failed for user ${fullUser.email}:`, error);
        badgeResult = {
          success: false,
          newBadges: [],
          errors: [error instanceof Error ? error.message : 'Unknown badge error']
        };
      }
    }

    // ✅ UPDATE USER XP AND LEVEL
    let totalXPGained = 0;
    let newLevel = fullUser.level;
    let newTotalXP = fullUser.totalXP;

    if (badgeResult.newBadges.length > 0) {
      totalXPGained = badgeResult.newBadges.reduce((sum, badge) => sum + (badge.xpValue || 0), 0);
      
      if (totalXPGained > 0) {
        newTotalXP = fullUser.totalXP + totalXPGained;
        newLevel = Math.floor(newTotalXP / 100) + 1;

        await prisma.user.update({
          where: { id: fullUser.id },
          data: {
            totalXP: newTotalXP,
            level: newLevel
          }
        });

        console.log(`💎 User ${fullUser.email} gained ${totalXPGained} XP! New total: ${newTotalXP} XP (Level ${newLevel})`);
      }
    }

    // Enhanced response with XP information
    const response = createSuccessResponse({
      lessonProgress: {
        ...lessonProgress,
        userId: fullUser.id
      },
      moduleProgress: {
        moduleId: lesson.moduleId,
        progress: moduleProgressPercentage,
        completed: isModuleCompleted,
        completedLessons: completedLessonsInModule,
        totalLessons: allLessonsInModule.length,
        userId: fullUser.id
      },
      badges: {
        success: badgeResult.success,
        newBadges: badgeResult.newBadges,
        badgeCount: badgeResult.newBadges.length,
        errors: badgeResult.errors
      },
      xp: {
        gained: totalXPGained,
        newTotal: newTotalXP,
        newLevel: newLevel,
        leveledUp: newLevel > fullUser.level
      }
    }, `Lesson progress updated successfully for ${fullUser.email}${badgeResult.newBadges.length > 0 ? ` - ${badgeResult.newBadges.length} new badges earned!` : ''}${totalXPGained > 0 ? ` +${totalXPGained} XP!` : ''}`)

    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to update lesson progress', 500))
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return addCacheHeaders(createAuthErrorResponse('Authentication required', 401))
    }

    const { lessonId } = params

    console.log(`📖 User ${user.email} (ID: ${user.id}) requesting progress for lesson ${lessonId}`)

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        moduleId: true
      }
    })

    if (!lesson) {
      return addCacheHeaders(createAuthErrorResponse('Lesson not found', 404))
    }

    // Get progress - ONLY for this user with explicit verification
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId_lessonId: {
          userId: user.id,
          moduleId: lesson.moduleId,
          lessonId: lessonId
        }
      }
    })

    if (!progress) {
      console.log(`📋 No progress found for user ${user.email} on lesson ${lessonId}`)
      const response = createSuccessResponse({
        completed: false,
        progress: 0,
        timeSpent: 0,
        userId: user.id
      }, `No progress found for ${user.email} on this lesson`)
      
      return addCacheHeaders(response)
    }

    // Verify the progress record belongs to this user
    if (progress.userId !== user.id) {
      console.error(`🚨 CRITICAL: Retrieved progress record belongs to different user! Expected: ${user.id}, Got: ${progress.userId}`);
      return addCacheHeaders(createAuthErrorResponse('Data integrity error', 500));
    }

    console.log(`📊 Progress found for user ${user.email}: ${progress.completed ? 'completed' : 'in progress'}`)

    const response = createSuccessResponse({
      completed: progress.completed,
      progress: progress.progress,
      timeSpent: progress.timeSpent,
      completedAt: progress.updatedAt,
      userId: user.id
    }, `Lesson progress retrieved successfully for ${user.email}`)

    return addCacheHeaders(response)

  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return addCacheHeaders(createAuthErrorResponse('Failed to fetch lesson progress', 500))
  }
}