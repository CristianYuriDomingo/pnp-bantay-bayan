// app/api/users/progress/lesson/[lessonId]/route.ts - FIXED with race condition handling
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

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

    const { lessonId } = params
    const body = await request.json()
    const { timeSpent = 0, progress = 100 } = body

    console.log(`📚 User ${user.email} (ID: ${user.id}) completing lesson ${lessonId}`)

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

    // Use the safe upsert function with retry logic
    const upsertResult = await safeUpsertProgress(
      user.id,
      lesson.moduleId,
      lessonId,
      timeSpent,
      progress
    );

    if (!upsertResult.success || !upsertResult.data) {
      console.error(`❌ Failed to update progress for user ${user.email}:`, upsertResult.error);
      return addCacheHeaders(createAuthErrorResponse(
        `Failed to update lesson progress: ${upsertResult.error}`, 
        500
      ));
    }

    const lessonProgress = upsertResult.data;

    // Verify the created/updated record belongs to this user
    if (lessonProgress.userId !== user.id) {
      console.error(`🚨 CRITICAL: Progress record user mismatch! Expected: ${user.id}, Got: ${lessonProgress.userId}`);
      return addCacheHeaders(createAuthErrorResponse('Data integrity error', 500));
    }

    // Calculate module progress - ONLY for this user with additional verification
    const allLessonsInModule = lesson.module.lessons.map(l => l.id)
    const completedLessonsInModule = await prisma.userProgress.count({
      where: {
        userId: user.id, // 🔒 CRITICAL: Only this user's progress
        moduleId: lesson.moduleId,
        lessonId: {
          in: allLessonsInModule
        },
        completed: true
      }
    })

    // Double-check by fetching the actual records to verify they all belong to this user
    const completedProgressRecords = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        moduleId: lesson.moduleId,
        lessonId: {
          in: allLessonsInModule
        },
        completed: true
      },
      select: { userId: true, lessonId: true }
    });

    // Verify all records belong to this user
    const invalidRecords = completedProgressRecords.filter(record => record.userId !== user.id);
    if (invalidRecords.length > 0) {
      console.error(`🚨 CRITICAL: Found ${invalidRecords.length} progress records with wrong userId`);
      return addCacheHeaders(createAuthErrorResponse('Data integrity error in progress calculation', 500));
    }

    console.log(`📈 User ${user.email} has completed ${completedLessonsInModule}/${allLessonsInModule.length} lessons in module ${lesson.moduleId}`)

    const moduleProgressPercentage = Math.round((completedLessonsInModule / allLessonsInModule.length) * 100)
    const isModuleCompleted = completedLessonsInModule === allLessonsInModule.length

    if (isModuleCompleted) {
      console.log(`🎉 User ${user.email} completed entire module ${lesson.moduleId}!`)
    }

    const response = createSuccessResponse({
      lessonProgress: {
        ...lessonProgress,
        userId: user.id // Explicitly include userId for verification
      },
      moduleProgress: {
        moduleId: lesson.moduleId,
        progress: moduleProgressPercentage,
        completed: isModuleCompleted,
        completedLessons: completedLessonsInModule,
        totalLessons: allLessonsInModule.length,
        userId: user.id // 🔒 Include user ID for verification
      }
    }, `Lesson progress updated successfully for ${user.email}`)

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
          userId: user.id, // 🔒 CRITICAL: Only this user's progress
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