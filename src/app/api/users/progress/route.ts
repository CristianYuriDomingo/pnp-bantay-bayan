// app/api/users/progress/route.ts - Get ONLY current user's overall progress
import { NextRequest } from 'next/server'
import { getApiUser, createSuccessResponse, createAuthErrorResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createAuthErrorResponse('Authentication required', 401)
    }

    console.log(`📊 Fetching progress for user: ${user.email} (ID: ${user.id})`)

    // Get ONLY this user's progress - no one else's
    const userProgress = await prisma.userProgress.findMany({
      where: {
        userId: user.id, // 🔒 CRITICAL: Only this user's data
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            image: true,
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            description: true,
          }
        }
      }
    })

    // Get all available modules to calculate progress against
    const modules = await prisma.module.findMany({
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    // Structure the progress data - ONLY for this user
    const moduleProgress: { [key: string]: any } = {}
    const lessonProgress: { [key: string]: any } = {}

    // Initialize module progress for this user
    modules.forEach(module => {
      // Filter to only this user's progress for this module
      const moduleUserProgress = userProgress.filter(p => 
        p.moduleId === module.id && p.userId === user.id // 🔒 Double-check user isolation
      )
      
      const completedLessons = moduleUserProgress.filter(p => p.lessonId && p.completed)
      
      moduleProgress[module.id] = {
        moduleId: module.id,
        title: module.title,
        image: module.image,
        completedLessons: completedLessons.map(p => p.lessonId),
        totalLessons: module.lessons.length,
        percentage: module.lessons.length > 0 
          ? Math.round((completedLessons.length / module.lessons.length) * 100)
          : 0,
        completedAt: completedLessons.length === module.lessons.length 
          ? completedLessons.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt
          : null,
        userId: user.id // 🔒 Include user ID for verification
      }
    })

    // Structure lesson progress - ONLY for this user
    userProgress.forEach(progress => {
      if (progress.lessonId && progress.userId === user.id) { // 🔒 Verify user ownership
        lessonProgress[progress.lessonId] = {
          lessonId: progress.lessonId,
          moduleId: progress.moduleId,
          completed: progress.completed,
          completedAt: progress.updatedAt,
          timeSpent: progress.timeSpent || 0,
          progress: progress.progress,
          userId: user.id // 🔒 Include user ID for verification
        }
      }
    })

    // Calculate overall statistics - ONLY for this user
    const totalModules = modules.length
    const completedModules = Object.values(moduleProgress).filter((mp: any) => mp.percentage === 100).length
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

    const progressData = {
      userId: user.id, // 🔒 Include user ID in response
      userEmail: user.email, // 🔒 Include email for verification
      moduleProgress,
      lessonProgress,
      statistics: {
        totalModules,
        completedModules,
        overallProgress,
        totalLessons: modules.reduce((sum, module) => sum + module.lessons.length, 0),
        completedLessons: Object.values(lessonProgress).filter((lp: any) => lp.completed).length
      }
    }

    console.log(`✅ Progress retrieved for user ${user.email}: ${completedModules}/${totalModules} modules completed`)

    return createSuccessResponse(progressData, `Progress retrieved successfully for ${user.email}`)

  } catch (error) {
    console.error('Error fetching user progress:', error)
    return createAuthErrorResponse('Failed to fetch progress', 500)
  }
}