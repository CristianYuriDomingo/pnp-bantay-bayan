// app/api/users/progress/lesson/[lessonId]/route.ts - FIXED
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401)
    }

    const { lessonId } = params
    const body = await request.json()
    const { timeSpent = 0, progress = 100 } = body

    console.log(`📚 User ${user.email} completing lesson ${lessonId}`)

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
      return createAuthErrorResponse('Lesson not found', 404)
    }

    // FIXED: Update lesson progress - ONLY for this user
    const lessonProgress = await prisma.userProgress.upsert({
      where: {
        userId_moduleId_lessonId: {
          userId: user.id,
          moduleId: lesson.moduleId,
          lessonId: lessonId
        }
      },
      update: {
        completed: true,
        timeSpent: timeSpent,
        progress: progress,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        moduleId: lesson.moduleId,
        lessonId: lessonId, // FIXED: Always provide lessonId, never null
        completed: true,
        timeSpent: timeSpent,
        progress: progress
      }
    })

    // Check completed lessons - ONLY for this user
    const allLessonsInModule = lesson.module.lessons.map(l => l.id)
    const completedLessonsInModule = await prisma.userProgress.count({
      where: {
        userId: user.id,
        moduleId: lesson.moduleId,
        lessonId: {
          in: allLessonsInModule
        },
        completed: true
      }
    })

    console.log(`📈 User ${user.email} has completed ${completedLessonsInModule}/${allLessonsInModule.length} lessons in module ${lesson.moduleId}`)

    // Calculate module progress percentage
    const moduleProgressPercentage = Math.round((completedLessonsInModule / allLessonsInModule.length) * 100)
    const isModuleCompleted = completedLessonsInModule === allLessonsInModule.length

    // REMOVED: Module-level progress entry creation
    // We'll calculate module progress on-demand instead of storing separate records
    
    if (isModuleCompleted) {
      console.log(`🎉 User ${user.email} completed entire module ${lesson.moduleId}!`)
    }

    return createSuccessResponse({
      lessonProgress,
      moduleProgress: {
        moduleId: lesson.moduleId,
        progress: moduleProgressPercentage,
        completed: isModuleCompleted,
        completedLessons: completedLessonsInModule,
        totalLessons: allLessonsInModule.length,
        userId: user.id // 🔒 Include user ID for verification
      }
    }, `Lesson progress updated successfully for ${user.email}`)

  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return createAuthErrorResponse('Failed to update lesson progress', 500)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401)
    }

    const { lessonId } = params

    console.log(`📖 User ${user.email} requesting progress for lesson ${lessonId}`)

    // Get lesson info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        moduleId: true
      }
    })

    if (!lesson) {
      return createAuthErrorResponse('Lesson not found', 404)
    }

    // Get progress - ONLY for this user
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId_lessonId: {
          userId: user.id,
          moduleId: lesson.moduleId,
          lessonId: lessonId
        }
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            moduleId: true
          }
        }
      }
    })

    if (!progress) {
      console.log(`📋 No progress found for user ${user.email} on lesson ${lessonId}`)
      return createSuccessResponse({
        completed: false,
        progress: 0,
        timeSpent: 0,
        userId: user.id
      }, `No progress found for ${user.email} on this lesson`)
    }

    console.log(`📊 Progress found for user ${user.email}: ${progress.completed ? 'completed' : 'in progress'}`)

    return createSuccessResponse({
      completed: progress.completed,
      progress: progress.progress,
      timeSpent: progress.timeSpent,
      completedAt: progress.updatedAt,
      userId: user.id
    }, `Lesson progress retrieved successfully for ${user.email}`)

  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return createAuthErrorResponse('Failed to fetch lesson progress', 500)
  }
}